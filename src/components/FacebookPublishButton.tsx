
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Share, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FacebookPreview } from "./FacebookPreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

type FacebookPublishButtonProps = {
  listing: Tables<"listings">;
};

export const FacebookPublishButton = ({ listing }: FacebookPublishButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('facebook_templates')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }
      
      setTemplates(data || []);
    };

    fetchTemplates();
  }, []);

  const publishToFacebook = async (message: string) => {
    try {
      setIsPublishing(true);
      console.log("Début de la publication sur Facebook");

      // Vérifier si l'utilisateur a connecté Facebook
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("facebook_page_id, facebook_access_token")
        .single();

      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError);
        throw new Error("Impossible de récupérer les informations de votre profil");
      }

      console.log("Profil récupéré:", {
        hasPageId: !!profile?.facebook_page_id,
        hasToken: !!profile?.facebook_access_token
      });

      if (!profile?.facebook_page_id || !profile?.facebook_access_token) {
        toast({
          title: "Facebook non connecté",
          description: "Veuillez d'abord connecter votre page Facebook dans votre profil",
          variant: "destructive",
        });
        return;
      }

      // Vérifier s'il y a un diaporama disponible pour ce listing (sans filtrer par statut)
      let finalVideoUrl: string | null = listing.video_url || null; // 1) Priorité à la vidéo stockée sur la fiche

      const { data: slideshowRows, error: slideshowError } = await supabase
        .from("slideshow_renders")
        .select("render_id, video_url, status")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (slideshowError) {
        console.warn("Erreur slideshow_renders:", slideshowError);
      }

      const slideshowData = (slideshowRows && (slideshowRows as any[]).length > 0)
        ? (slideshowRows as any[])[0]
        : null;

      // 2) Si pas de vidéo sur la fiche mais présente sur le rendu, l'utiliser
      if (!finalVideoUrl && slideshowData?.video_url) {
        finalVideoUrl = slideshowData.video_url;
      }

      // 3) Si un rendu existe mais sans URL vidéo, forcer une vérification fraîche du statut
      if (!finalVideoUrl && slideshowData?.render_id && !slideshowData?.video_url) {
        console.log("Aucun video_url en base, vérification immédiate via check-render-status…", slideshowData);
        const { data: statusData, error: statusError } = await supabase.functions.invoke("check-render-status", {
          body: { renderId: slideshowData.render_id },
        });
        if (statusError) {
          console.warn("Erreur check-render-status:", statusError);
        } else if (statusData?.videoUrl) {
          finalVideoUrl = statusData.videoUrl;
          console.log("URL vidéo récupérée via check-render-status:", finalVideoUrl);
        }
      }

      console.log("Diaporama (après vérification):", {
        hasRender: !!slideshowData,
        status: slideshowData?.status,
        videoUrl: finalVideoUrl,
      });

      // Décision de publication
      // 1) Si vidéo dispo -> publier en vidéo (diaporama)
      if (finalVideoUrl) {
        console.log("Tentative d'appel facebook-publish avec VIDEO");
        const { data: responseData, error: functionError } = await supabase.functions.invoke("facebook-publish", {
          body: {
            message,
            video: finalVideoUrl,
            pageId: profile.facebook_page_id,
            accessToken: profile.facebook_access_token,
          },
        });

        if (functionError) {
          console.error("Erreur lors de l'appel de la fonction:", functionError);
          throw new Error(functionError.message || "Erreur lors de la publication sur Facebook");
        }

        console.log("Réponse de la fonction:", responseData);
        
        if (!responseData?.id) {
          throw new Error("Aucun ID de publication reçu");
        }

        // Mise à jour et toasts sont gérés plus bas
        var publishResponseData: any = responseData;
      } else if (!slideshowData) {
        // 2) Aucune trace de rendu -> fallback aux images
        console.log("Aucun rendu détecté, fallback IMAGES");
        const { data: responseData, error: functionError } = await supabase.functions.invoke("facebook-publish", {
          body: {
            message,
            images: listing.images?.slice(0, 2),
            pageId: profile.facebook_page_id,
            accessToken: profile.facebook_access_token,
          },
        });

        if (functionError) {
          console.error("Erreur lors de l'appel de la fonction:", functionError);
          throw new Error(functionError.message || "Erreur lors de la publication sur Facebook");
        }

        if (!responseData?.id) {
          throw new Error("Aucun ID de publication reçu");
        }

        var publishResponseData: any = responseData;
      } else {
        // 3) Un rendu existe mais pas encore prêt -> éviter de publier une photo par erreur
        toast({
          title: "Diaporama en préparation",
          description: "Le diaporama est en cours de finalisation. Réessayez dans quelques secondes pour publier la vidéo.",
          variant: "destructive",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          published_to_facebook: true,
          facebook_post_id: publishResponseData.id,
        })
        .eq("id", listing.id);

      if (updateError) {
        console.error("Erreur lors de la mise à jour du statut:", updateError);
      }

      // Incrémenter les statistiques d'utilisation pour Facebook
      await ensureAndIncrementStatistic('facebook');

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      const contentType = finalVideoUrl ? "diaporama" : "annonce";
      // Afficher la confirmation avec le lien vers la publication
      toast({
        title: "Publication réussie ! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>Votre {contentType} a été publié sur Facebook avec succès.</p>
            <a
              href={`https://facebook.com/${publishResponseData.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Voir la publication <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ),
        duration: 5000,
      });
      
      setShowPreview(false);
    } catch (error) {
      console.error("Erreur détaillée de publication:", error);
      toast({
        title: "Erreur de publication",
        description: error.message || "Impossible de publier l'annonce sur Facebook",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Fonction pour gérer le clic sur le bouton de prévisualisation
  const handlePreviewClick = async () => {
    // Incrémenter les statistiques pour la génération de description
    await ensureAndIncrementStatistic('description');
    setShowPreview(true);
  };

  if (listing.published_to_facebook) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sélectionner un template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun template</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handlePreviewClick}
          disabled={isPublishing}
        >
          <Share className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Prévisualiser sur Facebook</span>
        </Button>
      </div>

      <FacebookPreview
        listing={listing}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPublish={publishToFacebook}
        selectedTemplateId={selectedTemplateId}
      />
    </>
  );
};

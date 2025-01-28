import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Share, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FacebookPreview } from "./FacebookPreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

      console.log("Tentative d'appel de la fonction facebook-publish");
      const { data: responseData, error: functionError } = await supabase.functions.invoke("facebook-publish", {
        body: {
          message,
          images: listing.images?.slice(0, 2), // Limit to 2 images
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

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          published_to_facebook: true,
          facebook_post_id: responseData.id,
        })
        .eq("id", listing.id);

      if (updateError) {
        console.error("Erreur lors de la mise à jour du statut:", updateError);
      }

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      // Afficher la confirmation avec le lien vers la publication
      toast({
        title: "Publication réussie ! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>Votre annonce a été publiée sur Facebook avec succès.</p>
            <a
              href={`https://facebook.com/${responseData.id}`}
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

  if (listing.published_to_facebook) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="w-[180px] flex-shrink-0">
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
          className="w-full min-w-0"
          onClick={() => setShowPreview(true)}
          disabled={isPublishing}
        >
          <Share className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Générer le texte</span>
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

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Share } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { InstagramPreview } from "./InstagramPreview";
import { toast } from "sonner";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

type InstagramPublishButtonProps = {
  listing: Tables<"listings">;
};

export const InstagramPublishButton = ({ listing }: InstagramPublishButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToInstagram = async (message: string, selectedImages: string[], templateId?: string) => {
    try {
      setIsPublishing(true);
      console.log("Début de la publication sur Instagram");

      // Client should not access tokens - pass user ID to edge function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Non connecté",
          description: "Vous devez être connecté pour publier",
          variant: "destructive",
        });
        return;
      }

      // Vérifier et prioriser l'URL vidéo du diaporama
      let finalVideoUrl: string | null = listing.video_url || null; // 1) Priorité à la vidéo enregistrée sur le listing

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

      if (!finalVideoUrl && slideshowData?.video_url) {
        finalVideoUrl = slideshowData.video_url;
      }

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

      // Appeler la fonction Edge pour publier sur Instagram
      let publishResponse;
      if (finalVideoUrl) {
        // 1) Vidéo prête -> publier en vidéo
        const { data, error } = await supabase.functions.invoke('instagram-publish', {
          body: {
            message,
            video: finalVideoUrl,
            listingId: listing.id,
            templateId,
          },
        });
        if (error) throw error;
        publishResponse = data;
      } else if (!slideshowData) {
        // 2) Aucun rendu détecté -> publier des images
        const { data, error } = await supabase.functions.invoke('instagram-publish', {
          body: {
            message,
            images: selectedImages,
            listingId: listing.id,
            templateId,
          },
        });
        if (error) throw error;
        publishResponse = data;
      } else {
        // 3) Un rendu existe mais pas encore prêt -> ne pas fallback en images
        toast({
          title: "Diaporama en préparation",
          description: "Le diaporama est en cours de finalisation. Réessayez dans quelques secondes pour publier la vidéo.",
          variant: "destructive",
        });
        return;
      }

      // Incrémenter les statistiques d'utilisation pour Instagram
      await ensureAndIncrementStatistic('instagram');

      const contentType = finalVideoUrl ? "diaporama" : "images";
      toast({
        title: "Publication réussie",
        description: `Votre ${contentType} a été publié sur Instagram`,
      });
      
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setShowPreview(false);
    } catch (error) {
      console.error("Erreur détaillée de publication:", error);
      toast({
        title: "Erreur de publication",
        description: error.message || "Impossible de publier l'annonce sur Instagram",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreviewClick = async () => {
    // Increment statistics for description generation when preview button is clicked
    await ensureAndIncrementStatistic('description');
    setShowPreview(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handlePreviewClick}
        disabled={isPublishing}
      >
        <Share className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="truncate">Prévisualiser et publier sur Instagram</span>
      </Button>

      <InstagramPreview
        listing={listing}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPublish={publishToInstagram}
      />
    </>
  );
};

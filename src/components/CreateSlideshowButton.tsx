import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { useToast } from "@/hooks/use-toast";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, videoUrl } = useSlideshow({ 
    listing,
    images: listing.images || []
  });
  const { publishToFacebook, isPublishing } = useFacebookPublish(listing);
  const { toast } = useToast();

  const handleCreateSlideshow = async () => {
    setIsOpen(true);
  };

  const handlePublish = async (message: string) => {
    let parsedVideoUrl = null;
    
    try {
      console.log("Video URL avant parsing:", videoUrl);
      
      if (videoUrl) {
        try {
          // Essayer de parser si c'est une chaîne JSON
          const parsed = JSON.parse(videoUrl);
          parsedVideoUrl = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {
          // Si ce n'est pas du JSON valide, utiliser directement la chaîne
          parsedVideoUrl = videoUrl;
        }
      }

      console.log("URL vidéo parsée:", parsedVideoUrl);

      if (!parsedVideoUrl) {
        toast({
          title: "Erreur de publication",
          description: "Aucune URL vidéo valide n'a été trouvée. Veuillez réessayer de générer le diaporama.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Publication avec l'URL vidéo:", parsedVideoUrl);
      const success = await publishToFacebook(parsedVideoUrl, message);
      
      if (success) {
        setIsOpen(false);
        return true;
      } else {
        toast({
          title: "Erreur de publication",
          description: "La publication sur Facebook a échoué. Veuillez réessayer.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      toast({
        title: "Erreur de publication",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    }
  };

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateSlideshow}
        disabled={isLoading || isPublishing}
      >
        {isLoading ? "Génération en cours..." : "Prévisualiser le diaporama"}
      </Button>

      <SlideshowPreviewDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        listing={listing}
        musicUrl="/background-music.mp3"
      />
    </>
  );
};
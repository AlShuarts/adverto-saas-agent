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
    if (!listing.video_url) {
      toast({
        title: "Génération du diaporama",
        description: "Veuillez patienter pendant la génération du diaporama...",
      });
    }
    setIsOpen(true);
  };

  const handlePublish = async (message: string) => {
    try {
      // D'abord, vérifier si nous avons une URL vidéo dans le listing
      let finalVideoUrl = listing.video_url || videoUrl;
      console.log("URL vidéo disponible:", finalVideoUrl);

      if (!finalVideoUrl) {
        toast({
          title: "Erreur de publication",
          description: "Aucune URL vidéo n'est disponible. Veuillez d'abord générer le diaporama.",
          variant: "destructive",
        });
        return false;
      }

      // Essayer de parser l'URL si c'est une chaîne JSON
      try {
        const parsed = JSON.parse(finalVideoUrl);
        finalVideoUrl = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        // Si ce n'est pas du JSON valide, utiliser directement la chaîne
        console.log("Utilisation de l'URL directe:", finalVideoUrl);
      }

      console.log("Tentative de publication avec l'URL:", finalVideoUrl);
      const success = await publishToFacebook(finalVideoUrl, message);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Le diaporama a été publié sur Facebook avec succès.",
        });
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
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
  const { isLoading } = useSlideshow({ 
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
      // Vérification de l'URL vidéo
      if (!listing.video_url) {
        toast({
          title: "Erreur de publication",
          description: "Aucune URL vidéo n'est disponible. Veuillez d'abord générer le diaporama.",
          variant: "destructive",
        });
        return false;
      }

      // Vérification que c'est une URL Supabase Storage
      const isSupabaseUrl = listing.video_url.includes('supabase.co/storage/v1/object/public/listings-images');
      if (!isSupabaseUrl) {
        toast({
          title: "Erreur de publication",
          description: "L'URL du diaporama n'est pas valide. Veuillez régénérer le diaporama.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Publication du diaporama avec l'URL:", listing.video_url);
      const success = await publishToFacebook(listing.video_url, message);
      
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
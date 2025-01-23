import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";

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

  const handleCreateSlideshow = async () => {
    setIsOpen(true);
  };

  const handlePublish = async (message: string) => {
    // Parse le videoUrl qui est stocké comme une chaîne JSON
    let parsedVideoUrl = null;
    try {
      if (videoUrl) {
        const urls = JSON.parse(videoUrl);
        parsedVideoUrl = Array.isArray(urls) ? urls[0] : urls;
      }
    } catch (error) {
      console.error("Erreur lors du parsing de l'URL vidéo:", error);
      return false;
    }

    if (!parsedVideoUrl) {
      console.error("Aucune URL vidéo valide trouvée");
      return false;
    }

    console.log("Publication avec l'URL vidéo:", parsedVideoUrl);
    const success = await publishToFacebook(parsedVideoUrl, message);
    if (success) {
      setIsOpen(false);
    }
    return success;
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
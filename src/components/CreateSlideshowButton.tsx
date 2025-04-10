
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { Video } from "lucide-react";

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
    const success = await publishToFacebook(videoUrl, message);
    if (success) {
      setIsOpen(false);
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
        className="w-full"
      >
        <Video className="w-4 h-4 mr-2" />
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

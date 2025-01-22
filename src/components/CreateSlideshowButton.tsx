import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { useToast } from "@/hooks/use-toast";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { generateVideo, isLoading } = useVideoGeneration(listing.id);
  const { publishToFacebook, isPublishing } = useFacebookPublish(listing);

  const handleCreateVideo = async () => {
    const videoUrl = await generateVideo();
    if (videoUrl) {
      setIsOpen(true);
    }
  };

  const handlePublish = async () => {
    if (!listing.video_url) {
      toast({
        title: "Erreur",
        description: "Aucune vidéo n'a été générée",
        variant: "destructive",
      });
      return;
    }

    const success = await publishToFacebook(listing.video_url);
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
        onClick={handleCreateVideo}
        disabled={isLoading || isPublishing}
      >
        {isLoading ? "Génération en cours..." : "Créer une vidéo"}
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
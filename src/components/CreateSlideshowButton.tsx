import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { videoUrl } = useSlideshow({ 
    listing,
    images: listing.images || []
  });
  const { publishToFacebook, isPublishing } = useFacebookPublish(listing);

  const handleCreateSlideshow = async () => {
    if (!listing.video_url) {
      setIsGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-slideshow', {
          body: { listingId: listing.id }
        });

        if (error) throw error;

        if (data.url) {
          toast({
            title: "Succès",
            description: "Le diaporama a été généré avec succès",
          });
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error generating slideshow:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération du diaporama",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handlePublish = async () => {
    const success = await publishToFacebook(videoUrl);
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
        disabled={isGenerating || isPublishing}
      >
        {isGenerating ? "Génération en cours..." : "Prévisualiser le diaporama"}
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
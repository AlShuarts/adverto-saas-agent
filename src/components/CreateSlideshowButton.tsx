
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, videoUrl, setVideoUrl, createSlideshow } = useSlideshow({ 
    listing,
    images: listing.images || []
  });
  const { publishToFacebook, isPublishing } = useFacebookPublish(listing);

  const handleCreateSlideshow = async () => {
    const result = await createSlideshow();
    if (result) {
      setIsOpen(true);
    }
  };

  const handlePublish = async (message: string) => {
    // Toujours tenter de récupérer la dernière vidéo générée côté base
    const { data: slideshowData } = await supabase
      .from("slideshow_renders")
      .select("video_url, status")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const finalVideoUrl = slideshowData?.video_url || videoUrl;

    if (!finalVideoUrl) {
      toast.error("Le diaporama n'est pas encore prêt. Réessayez dans quelques secondes.");
      return;
    }

    const success = await publishToFacebook(finalVideoUrl, message);
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

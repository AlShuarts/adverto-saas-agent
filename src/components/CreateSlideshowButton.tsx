import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Player } from "@remotion/player";
import { Sequence } from "@remotion/core";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

const SlideShowComposition = ({ images }: { images: string[] }) => {
  return (
    <div style={{ backgroundColor: 'white', width: '100%', height: '100%' }}>
      {images.map((image, index) => (
        <Sequence key={index} from={index * 60} durationInFrames={60}>
          <img
            src={image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            alt={`Slide ${index + 1}`}
          />
        </Sequence>
      ))}
    </div>
  );
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateSlideshow = () => {
    setIsOpen(true);
    toast({
      title: "Succès",
      description: "Le diaporama a été créé avec succès",
    });
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
      >
        Créer un diaporama
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video w-full">
            <Player
              component={SlideShowComposition}
              inputProps={{ images: listing.images }}
              durationInFrames={listing.images.length * 60}
              fps={30}
              compositionWidth={1920}
              compositionHeight={1080}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
              autoPlay
              loop
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
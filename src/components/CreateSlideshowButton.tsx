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
  console.log("Rendering slideshow with images:", images);
  return (
    <div style={{ flex: 1, backgroundColor: 'white', position: 'relative', width: '100%', height: '100%' }}>
      {images.map((image, index) => (
        <Sequence key={index} from={index * 60} durationInFrames={60}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}>
            <img
              src={image}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              alt={`Slide ${index + 1}`}
            />
          </div>
        </Sequence>
      ))}
    </div>
  );
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateSlideshow = () => {
    console.log("Opening slideshow with images:", listing.images);
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
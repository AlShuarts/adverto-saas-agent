import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Player } from "@remotion/player";
import { Tables } from "@/integrations/supabase/types";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

const SlideShowComposition = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  console.log("Rendering slideshow with images:", images);
  return (
    <div style={{ flex: 1, backgroundColor: 'white', position: 'relative', width: '100%', height: '100%' }}>
      {images.map((image, index) => {
        console.log(`Rendering image ${index + 1}:`, image);
        return (
          <div
            key={index}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <img
              src={image}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
              }}
              alt={`Slide ${index + 1}`}
              onError={(e) => {
                console.error(`Error loading image ${index + 1}:`, image, e);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={(e) => {
                console.log(`Image ${index + 1} loaded successfully:`, {
                  naturalWidth: (e.target as HTMLImageElement).naturalWidth,
                  naturalHeight: (e.target as HTMLImageElement).naturalHeight,
                });
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateSlideshow = () => {
    if (!listing.images || listing.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune image disponible pour le diaporama",
        variant: "destructive",
      });
      return;
    }

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
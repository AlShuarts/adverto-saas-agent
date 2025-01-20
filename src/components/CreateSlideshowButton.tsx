import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Player } from "@remotion/player";
import { Tables } from "@/integrations/supabase/types";
import { SlideShowComposition } from "./slideshow/SlideShowComposition";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getBackgroundMusics, BackgroundMusic } from "./slideshow/backgroundMusic";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [musics, setMusics] = useState<BackgroundMusic[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadMusics = async () => {
      try {
        const availableMusics = await getBackgroundMusics();
        setMusics(availableMusics);
        if (availableMusics.length > 0) {
          setSelectedMusic(availableMusics[0].url);
        }
      } catch (error) {
        console.error('Error loading background music:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les musiques de fond",
          variant: "destructive",
        });
      }
    };

    loadMusics();
  }, [toast]);

  const handleCreateSlideshow = () => {
    if (!listing.images || listing.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune image disponible pour le diaporama",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMusic) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une musique de fond",
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Musique de fond</Label>
              <RadioGroup
                value={selectedMusic || undefined}
                onValueChange={setSelectedMusic}
                className="space-y-2"
              >
                {musics.map((music) => (
                  <div key={music.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={music.url} id={music.id} />
                    <Label htmlFor={music.id}>{music.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="aspect-video w-full">
              <Player
                component={SlideShowComposition}
                inputProps={{ 
                  images: listing.images,
                  musicUrl: selectedMusic || undefined
                }}
                durationInFrames={listing.images.length * 60}
                fps={30}
                compositionWidth={1920}
                compositionHeight={1080}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                controls
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
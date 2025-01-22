import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { getBackgroundMusics, BackgroundMusic } from "./slideshow/backgroundMusic";
import { MusicSelector } from "./slideshow/MusicSelector";
import { SlideshowPlayer } from "./slideshow/SlideshowPlayer";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [musics, setMusics] = useState<BackgroundMusic[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleCreateSlideshow = async () => {
    if (!listing.images || listing.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune image disponible pour le diaporama",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://msmuyhmxlrkcjthugcxd.supabase.co/functions/v1/generate-music-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listing }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la musique');
      }

      const { musicUrl } = await response.json();
      setSelectedMusic(musicUrl);
      setIsOpen(true);
      
      toast({
        title: "Succès",
        description: "Le diaporama a été créé avec succès",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la musique de fond",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        disabled={isLoading}
      >
        {isLoading ? "Génération en cours..." : "Créer un diaporama"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Diaporama</DialogTitle>
          <div className="space-y-4">
            <MusicSelector
              musics={musics}
              selectedMusic={selectedMusic}
              onMusicChange={setSelectedMusic}
            />
            {listing.images && (
              <SlideshowPlayer
                images={listing.images}
                musicUrl={selectedMusic}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
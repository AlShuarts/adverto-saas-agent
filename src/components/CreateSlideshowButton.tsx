import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { MusicSelector } from "./slideshow/MusicSelector";
import { SlideshowPlayer } from "./slideshow/SlideshowPlayer";
import { supabase } from "@/integrations/supabase/client";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: { listing }
      });

      if (error) {
        throw error;
      }

      const { musicUrl } = data;
      setSelectedMusic(musicUrl);
      setIsOpen(true);
      
      toast({
        title: "Succès",
        description: "La musique a été générée avec succès",
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
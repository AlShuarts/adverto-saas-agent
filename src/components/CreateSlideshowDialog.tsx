import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { SlideshowImageSelector } from "./slideshow/SlideshowImageSelector";
import { SlideshowMusicSelector } from "./slideshow/SlideshowMusicSelector";
import { useSlideshowConfig } from "@/hooks/useSlideshowConfig";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

type CreateSlideshowDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const CreateSlideshowDialog = ({ listing, isOpen, onClose }: CreateSlideshowDialogProps) => {
  const { 
    config, 
    setConfig,
    musicList,
    audioPlaying,
    setAudioPlaying,
    currentlyPlaying,
    setCurrentlyPlaying
  } = useSlideshowConfig(listing);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleMusicChange = (value: string) => {
    stopAudio();
    setConfig(prev => ({ ...prev, selectedMusic: value }));
  };

  const previewMusic = (musicName: string) => {
    if (currentlyPlaying === musicName) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio();
    audio.src = `${supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl}`;
    audio.volume = config.musicVolume;
    audio.play();
    setAudioPlaying(audio);
    setCurrentlyPlaying(musicName);
  };

  const stopAudio = () => {
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setConfig(prev => ({
      ...prev,
      selectedImages: prev.selectedImages.includes(imageUrl)
        ? prev.selectedImages.filter(url => url !== imageUrl)
        : [...prev.selectedImages, imageUrl]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      console.log("Configuration envoyée:", config);
      await ensureAndIncrementStatistic('slideshow');
      
      const response = await supabase.functions.invoke("create-slideshow", {
        body: {
          listingId: listing.id,
          config: {
            imageDuration: 3,
            showDetails: true,
            showPrice: true,
            showAddress: true,
            selectedImages: config.selectedImages,
            selectedMusic: config.selectedMusic
          }
        }
      });
      
      if (response.error) throw response.error;
      
      toast.success("Création du diaporama initiée", {
        description: "Vous serez notifié lorsque le diaporama sera prêt."
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating slideshow:", error);
      toast.error("Une erreur est survenue lors de la création du diaporama");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un diaporama</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <SlideshowImageSelector
            images={listing.images || []}
            selectedImages={config.selectedImages}
            onImageSelect={toggleImageSelection}
          />

          <SlideshowMusicSelector
            musicList={musicList}
            selectedMusic={config.selectedMusic}
            currentlyPlaying={currentlyPlaying}
            onMusicChange={handleMusicChange}
            onPreviewMusic={previewMusic}
          />

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer le diaporama"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

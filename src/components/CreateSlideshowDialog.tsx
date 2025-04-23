
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { SlideshowImageSelector } from "./slideshow/SlideshowImageSelector";
import { SlideshowMusicSelector } from "./slideshow/SlideshowMusicSelector";
import { useSlideshowConfig } from "@/hooks/useSlideshowConfig";
import { useAudioControls } from "@/hooks/useAudioControls";
import { useSlideshowSubmit } from "@/hooks/useSlideshowSubmit";
import { supabase } from "@/integrations/supabase/client";

type CreateSlideshowDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const CreateSlideshowDialog = ({ listing, isOpen, onClose }: CreateSlideshowDialogProps) => {
  const { config, setConfig, musicList } = useSlideshowConfig(listing);
  const { currentlyPlaying, playAudio, stopAudio } = useAudioControls();
  const { isLoading, handleSubmit } = useSlideshowSubmit(listing, onClose);

  const handleMusicChange = (value: string) => {
    stopAudio();
    setConfig(prev => ({ ...prev, selectedMusic: value }));
  };

  const handlePreviewMusic = (musicName: string) => {
    const publicUrl = supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl;
    playAudio(musicName, publicUrl, config.musicVolume);
  };

  const toggleImageSelection = (imageUrl: string) => {
    setConfig(prev => ({
      ...prev,
      selectedImages: prev.selectedImages.includes(imageUrl)
        ? prev.selectedImages.filter(url => url !== imageUrl)
        : [...prev.selectedImages, imageUrl]
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(config);
  };

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen, stopAudio]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un diaporama</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 py-4">
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
            onPreviewMusic={handlePreviewMusic}
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

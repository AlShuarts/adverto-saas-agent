
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { SlideshowImageSelector } from "./slideshow/SlideshowImageSelector";
import { useSlideshowConfig } from "@/hooks/useSlideshowConfig";
import { useAudioControls } from "@/hooks/useAudioControls";
import { useSlideshowSubmit } from "@/hooks/useSlideshowSubmit";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Music, Play, Pause } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type CreateSlideshowDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const CreateSlideshowDialog = ({ listing, isOpen, onClose }: CreateSlideshowDialogProps) => {
  const { config, setConfig, musicList } = useSlideshowConfig(listing);
  const { currentlyPlaying, playAudio, stopAudio } = useAudioControls();
  const { isLoading, handleSubmit } = useSlideshowSubmit(listing, onClose);
  const isMobile = useIsMobile();

  const handleMusicChange = (value: string) => {
    console.log("Music changed to:", value);
    stopAudio();
    setConfig(prev => ({ ...prev, selectedMusic: value }));
  };

  const handlePreviewMusic = (musicName: string) => {
    console.log("Preview music:", musicName);
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
    console.log("Submitting with config:", config);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Créer un diaporama</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 py-4 overflow-y-auto flex-1">
          <SlideshowImageSelector
            images={listing.images || []}
            selectedImages={config.selectedImages}
            onImageSelect={toggleImageSelection}
          />

          {/* Inline music selector to replace SlideshowMusicSelector */}
          <div className="space-y-2">
            <Label>Musique de fond</Label>
            <div className="flex items-center gap-2">
              <Select 
                value={config.selectedMusic || ""} 
                onValueChange={handleMusicChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une musique" />
                </SelectTrigger>
                <SelectContent>
                  {musicList.map(music => (
                    <SelectItem key={music} value={music}>
                      {music.replace(/\.[^/.]+$/, "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {config.selectedMusic && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handlePreviewMusic(config.selectedMusic!)}
                  className="flex-shrink-0"
                  aria-label={currentlyPlaying === config.selectedMusic ? "Arrêter la musique" : "Écouter la musique"}
                  title={currentlyPlaying === config.selectedMusic ? "Arrêter la musique" : "Écouter la musique"}
                >
                  {currentlyPlaying === config.selectedMusic ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            
            {config.selectedMusic ? (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Music className="h-3 w-3" /> 
                Musique sélectionnée: {config.selectedMusic.replace(/\.[^/.]+$/, "")}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Aucune musique sélectionnée
              </p>
            )}
          </div>

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

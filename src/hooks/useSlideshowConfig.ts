
import { useState, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type SlideshowConfig = {
  showPrice: boolean;
  showDetails: boolean;
  showAddress: boolean;
  showBedrooms: boolean;
  showBathrooms: boolean;
  showPropertyType: boolean;
  transition: string;
  musicVolume: number;
  selectedImages: string[];
  selectedMusic?: string;
};

export const useSlideshowConfig = (listing: Tables<"listings">) => {
  const [config, setConfig] = useState<SlideshowConfig>({
    showPrice: true,
    showDetails: true,
    showAddress: true,
    showBedrooms: true,
    showBathrooms: true,
    showPropertyType: true,
    transition: "fade",
    musicVolume: 0.5,
    selectedImages: listing.images || [],
    selectedMusic: undefined
  });
  
  const [musicList, setMusicList] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const { data, error } = await supabase.storage.from('background-music').list();
        if (error) {
          console.error("Erreur lors de la récupération des musiques:", error);
          return;
        }
        if (data) {
          const musicFiles = data
            .filter(file => !file.name.startsWith('.'))
            .map(file => file.name);
          setMusicList(musicFiles);
          if (musicFiles.length > 0 && !config.selectedMusic) {
            setConfig(prev => ({ ...prev, selectedMusic: musicFiles[0] }));
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    fetchMusic();
  }, []);

  return {
    config,
    setConfig,
    musicList,
    audioPlaying,
    setAudioPlaying,
    currentlyPlaying,
    setCurrentlyPlaying
  };
};

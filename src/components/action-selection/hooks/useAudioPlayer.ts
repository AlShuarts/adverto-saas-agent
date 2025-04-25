
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAudioPlayer = () => {
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [musicList, setMusicList] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);

  const fetchMusic = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage.from('background-music').list();
      
      if (!error && data) {
        const musicFiles = data
          .filter(file => !file.name.startsWith('.'))
          .map(file => file.name);
        
        setMusicList(musicFiles);
        if (musicFiles.length > 0) {
          setSelectedMusic(musicFiles[0]);
          console.log("Musique par défaut définie:", musicFiles[0]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des musiques:", error);
    }
  }, []);

  const handleMusicChange = useCallback((value: string) => {
    console.log("Musique sélectionnée changée pour:", value);
    stopAudio();
    setSelectedMusic(value);
  }, []);

  const previewMusic = useCallback((musicName: string) => {
    if (currentlyPlaying === musicName) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio();
    const publicUrl = supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl;
    console.log("Prévisualisation de la musique:", musicName, "URL:", publicUrl);
    audio.src = publicUrl;
    audio.volume = 0.5;
    audio.play();
    setAudioPlaying(audio);
    setCurrentlyPlaying(musicName);
  }, [currentlyPlaying]);

  const stopAudio = useCallback(() => {
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  }, [audioPlaying]);

  // Log l'état de la musique sélectionnée à chaque changement
  useEffect(() => {
    if (selectedMusic) {
      console.log("État actuel de la musique sélectionnée:", selectedMusic);
    }
  }, [selectedMusic]);

  return {
    // Fixed audioPlaying property to be a boolean as expected by the context
    audioPlaying: !!audioPlaying,
    currentlyPlaying,
    musicList,
    selectedMusic,
    fetchMusic,
    handleMusicChange,
    previewMusic,
    stopAudio
  };
};

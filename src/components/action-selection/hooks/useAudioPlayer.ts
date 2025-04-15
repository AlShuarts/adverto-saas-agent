
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAudioPlayer = () => {
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [musicList, setMusicList] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);

  const fetchMusic = useCallback(async () => {
    const { data, error } = await supabase.storage.from('background-music').list();
    
    if (!error && data) {
      const musicFiles = data
        .filter(file => !file.name.startsWith('.'))
        .map(file => file.name);
      
      setMusicList(musicFiles);
      if (musicFiles.length > 0) {
        setSelectedMusic(musicFiles[0]);
      }
    }
  }, []);

  const handleMusicChange = useCallback((value: string) => {
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
    audio.src = `${supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl}`;
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

  return {
    audioPlaying,
    currentlyPlaying,
    musicList,
    selectedMusic,
    fetchMusic,
    handleMusicChange,
    previewMusic,
    stopAudio
  };
};

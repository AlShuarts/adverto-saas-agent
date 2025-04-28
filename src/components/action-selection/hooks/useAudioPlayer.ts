
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudioPlayer = () => {
  const [musicList, setMusicList] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string>("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const fetchMusic = useCallback(async () => {
    console.log("Fetching music list...");
    try {
      const { data, error } = await supabase.storage.from('background-music').list();
      
      if (error) {
        console.error("Error fetching music list:", error);
        return;
      }
      
      if (data) {
        const musicFiles = data
          .filter(file => !file.name.startsWith('.'))
          .map(file => file.name);
        
        console.log("Music files fetched:", musicFiles);
        setMusicList(musicFiles);
        
        if (musicFiles.length > 0 && !selectedMusic) {
          console.log("Setting initial music selection:", musicFiles[0]);
          setSelectedMusic(musicFiles[0]);
        }
      }
    } catch (error) {
      console.error("Error in fetchMusic:", error);
    }
  }, []); // Removed selectedMusic dependency to avoid circular dependency

  useEffect(() => {
    fetchMusic();
  }, [fetchMusic]);

  const handleMusicChange = (value: string) => {
    console.log("Music selection changed to:", value);
    stopAudio();
    setSelectedMusic(value);
  };

  const previewMusic = (musicName: string) => {
    console.log("Preview music request:", musicName);
    
    if (currentlyPlaying === musicName) {
      stopAudio();
      return;
    }

    try {
      const publicUrl = supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl;
      console.log("Playing music from URL:", publicUrl);
      
      stopAudio();
      const audio = new Audio(publicUrl);
      audio.volume = 0.5;
      audio.play();
      setAudioElement(audio);
      setCurrentlyPlaying(musicName);
    } catch (error) {
      console.error("Error setting up audio playback:", error);
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
      setCurrentlyPlaying(null);
    }
  };

  return {
    currentlyPlaying,
    musicList,
    selectedMusic,
    setSelectedMusic,
    stopAudio,
    handleMusicChange,
    previewMusic,
    fetchMusic
  };
};

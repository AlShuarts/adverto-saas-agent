
import { useAudioControls } from '@/hooks/useAudioControls';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudioPlayer = () => {
  const [musicList, setMusicList] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);
  const { currentlyPlaying, playAudio, stopAudio } = useAudioControls();

  const fetchMusic = useCallback(async () => {
    try {
      console.log("Fetching music list...");
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
        
        // Set default selected music if available
        if (musicFiles.length > 0 && !selectedMusic) {
          setSelectedMusic(musicFiles[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  }, [selectedMusic]);

  const handleMusicChange = (value: string) => {
    console.log("Music selection changed to:", value);
    stopAudio();
    setSelectedMusic(value);
  };

  const previewMusic = (musicName: string) => {
    console.log("Attempting to preview music:", musicName);
    if (currentlyPlaying === musicName) {
      console.log("Stopping current music preview");
      stopAudio();
      return;
    }

    try {
      const publicUrl = supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl;
      console.log("Playing music preview from URL:", publicUrl);
      playAudio(musicName, publicUrl, 0.5);
    } catch (error) {
      console.error("Error setting up audio playback:", error);
    }
  };

  return {
    currentlyPlaying,
    musicList,
    selectedMusic,
    setSelectedMusic,
    fetchMusic,
    stopAudio,
    handleMusicChange,
    previewMusic
  };
};

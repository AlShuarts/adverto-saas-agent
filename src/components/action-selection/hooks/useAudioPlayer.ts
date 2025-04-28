
import { useAudioControls } from '@/hooks/useAudioControls';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudioPlayer = () => {
  const [musicList, setMusicList] = useState<string[]>([]);
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
      }
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  }, []);

  return {
    currentlyPlaying,
    musicList,
    fetchMusic,
    stopAudio
  };
};

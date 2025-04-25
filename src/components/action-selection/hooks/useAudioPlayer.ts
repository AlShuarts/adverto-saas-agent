
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
        // Only set default music if no music is currently selected
        if (musicFiles.length > 0 && !selectedMusic) {
          setSelectedMusic(musicFiles[0]);
          console.log("Default music set to:", musicFiles[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  }, [selectedMusic]);

  const handleMusicChange = useCallback((value: string) => {
    console.log("Music selection changed to:", value);
    stopAudio();
    setSelectedMusic(value);
  }, []);

  const previewMusic = useCallback((musicName: string) => {
    console.log("Attempting to preview music:", musicName);
    
    if (currentlyPlaying === musicName) {
      console.log("Stopping current music preview");
      stopAudio();
      return;
    }

    stopAudio();
    const audio = new Audio();
    const publicUrl = supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl;
    console.log("Playing music preview from URL:", publicUrl);
    
    audio.src = publicUrl;
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
    });
    
    setAudioPlaying(audio);
    setCurrentlyPlaying(musicName);
  }, [currentlyPlaying]);

  const stopAudio = useCallback(() => {
    if (audioPlaying) {
      console.log("Stopping audio playback");
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  }, [audioPlaying]);

  // Fetch music on component mount
  useEffect(() => {
    console.log("Initial music fetch");
    fetchMusic();
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log("Music state updated:", {
      selectedMusic,
      currentlyPlaying,
      musicList
    });
  }, [selectedMusic, currentlyPlaying, musicList]);

  return {
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

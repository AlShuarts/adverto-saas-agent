
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAudioPlayer = () => {
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [musicList, setMusicList] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        
        if (musicFiles.length > 0 && !selectedMusic) {
          console.log("Setting default music to:", musicFiles[0]);
          setSelectedMusic(musicFiles[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  }, [selectedMusic]);

  const handleMusicChange = useCallback((value: string) => {
    console.log("Music selection changed to:", value);
    if (value) {
      stopAudio();
      setSelectedMusic(value);
    }
  }, []);

  const previewMusic = useCallback((musicName: string) => {
    console.log("Attempting to preview music:", musicName);
    
    if (currentlyPlaying === musicName) {
      console.log("Stopping current music preview");
      stopAudio();
      return;
    }

    stopAudio();
    
    try {
      const publicUrl = supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl;
      console.log("Playing music preview from URL:", publicUrl);
      
      const audio = new Audio(publicUrl);
      audioRef.current = audio;
      audio.volume = 0.5;
      
      // Add event listeners for better error handling
      audio.addEventListener('error', (e) => {
        console.error("Audio playback error:", e);
        stopAudio();
      });
      
      audio.addEventListener('ended', () => {
        console.log("Audio playback ended");
        setAudioPlaying(null);
        setCurrentlyPlaying(null);
      });
      
      // Play the audio
      audio.play()
        .then(() => {
          console.log("Audio playing successfully");
          setAudioPlaying(audio);
          setCurrentlyPlaying(musicName);
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          stopAudio();
        });
    } catch (error) {
      console.error("Error setting up audio playback:", error);
    }
  }, [currentlyPlaying]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      console.log("Stopping audio playback");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  }, []);

  // Fetch music immediately on component mount
  useEffect(() => {
    console.log("Initial music fetch");
    fetchMusic();
    
    // Cleanup function to stop audio when component unmounts
    return () => {
      stopAudio();
    };
  }, [fetchMusic]);

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

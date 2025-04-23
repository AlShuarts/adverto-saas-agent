
import { useState } from 'react';

export const useAudioControls = () => {
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const playAudio = (musicName: string, audioUrl: string, volume: number = 1) => {
    if (currentlyPlaying === musicName) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audio.play();
    setAudioPlaying(audio);
    setCurrentlyPlaying(musicName);
  };

  const stopAudio = () => {
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  };

  return {
    currentlyPlaying,
    playAudio,
    stopAudio
  };
};


import { useEffect, useRef } from "react";
import { SlideShowImage } from "./SlideShowImage";

export const SLIDE_DURATION = 3000; // 3 secondes en millisecondes

type SlideShowCompositionProps = {
  images: string[];
  musicUrl?: string | null;
  isPlaying?: boolean;
  volume?: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
};

export const SlideShowComposition = ({ 
  images,
  musicUrl,
  isPlaying = true,
  volume = 1,
  currentIndex,
  onIndexChange,
}: SlideShowCompositionProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying) {
      console.log('Starting slideshow interval in composition');
      interval = setInterval(() => {
        onIndexChange((currentIndex + 1) % images.length);
      }, SLIDE_DURATION);
    }

    return () => {
      console.log('Cleaning up slideshow interval in composition');
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, images.length, currentIndex, onIndexChange]);

  // Handle volume and mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = volume === 0;
    }
  }, [volume]);

  // Handle play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {images.map((image, index) => (
        <SlideShowImage
          key={index}
          src={image}
          index={index}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
        />
      ))}
      
      {/* Audio element for music playback */}
      {musicUrl && (
        <audio
          ref={audioRef}
          loop
          src={musicUrl}
          className="hidden"
        />
      )}
    </div>
  );
};

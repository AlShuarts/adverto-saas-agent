import { useEffect } from "react";
import { SlideShowImage } from "./SlideShowImage";

export const SLIDE_DURATION = 3000; // 3 secondes en millisecondes

type SlideShowCompositionProps = {
  images: string[];
  musicUrl?: string;
  isPlaying?: boolean;
  volume?: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
};

export const SlideShowComposition = ({ 
  images,
  isPlaying = true,
  currentIndex,
  onIndexChange,
}: SlideShowCompositionProps) => {
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
    </div>
  );
};
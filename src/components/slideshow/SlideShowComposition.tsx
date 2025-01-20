import { useState, useEffect } from "react";
import { SlideShowImage } from "./SlideShowImage";

type SlideShowCompositionProps = {
  images: string[];
  musicUrl?: string;
  isPlaying?: boolean;
  volume?: number;
};

export const SlideShowComposition = ({ 
  images,
  isPlaying = true,
}: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying) {
      console.log('Starting slideshow interval in composition');
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
    }

    return () => {
      console.log('Cleaning up slideshow interval in composition');
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, images.length]);

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
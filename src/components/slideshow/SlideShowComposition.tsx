import { useState, useEffect } from "react";
import { SlideShowImage } from "./SlideShowImage";
import { getRandomBackgroundMusic } from "./backgroundMusic";

type SlideShowCompositionProps = {
  images: string[];
};

export const SlideShowComposition = ({ images }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audio] = useState(() => new Audio(getRandomBackgroundMusic().data));

  useEffect(() => {
    // Configurer l'audio
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(console.error);

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [images.length, audio]);

  return (
    <div style={{ flex: 1, backgroundColor: 'black', position: 'relative', width: '100%', height: '100%' }}>
      {images.map((image, index) => (
        <SlideShowImage
          key={index}
          src={image}
          index={index}
          currentIndex={currentIndex}
        />
      ))}
    </div>
  );
};
import { useState, useEffect } from "react";
import { SlideShowImage } from "./SlideShowImage";
import { backgroundMusic } from "../../../supabase/functions/create-slideshow/background-music";

type SlideShowCompositionProps = {
  images: string[];
};

export const SlideShowComposition = ({ images }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audio] = useState(new Audio(backgroundMusic));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    // Démarrer la musique
    audio.loop = true;
    audio.volume = 0.5; // Volume à 50%
    audio.play().catch(error => {
      console.log("Erreur lors de la lecture de l'audio:", error);
    });

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
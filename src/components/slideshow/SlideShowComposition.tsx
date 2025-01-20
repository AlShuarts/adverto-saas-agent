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
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  // Précharger toutes les images
  useEffect(() => {
    const preloadImages = async () => {
      const promises = images.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            console.log(`Image préchargée avec succès: ${src}`);
            resolve(src);
          };
          img.onerror = () => {
            console.error(`Erreur lors du préchargement de l'image: ${src}`);
            reject(src);
          };
        });
      });

      try {
        const loaded = await Promise.all(promises);
        setLoadedImages(loaded);
        console.log('Toutes les images ont été préchargées');
      } catch (error) {
        console.error('Erreur lors du préchargement des images:', error);
      }
    };

    preloadImages();
  }, [images]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying && loadedImages.length === images.length) {
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
  }, [isPlaying, images.length, loadedImages.length]);

  if (loadedImages.length !== images.length) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="text-white">Chargement des images...</div>
      </div>
    );
  }

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
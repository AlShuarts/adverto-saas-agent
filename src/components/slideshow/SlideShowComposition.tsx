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
  const [isLoading, setIsLoading] = useState(true);

  // Précharger toutes les images avec une meilleure gestion de la qualité
  useEffect(() => {
    const preloadImages = async () => {
      setIsLoading(true);
      const promises = images.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          
          // Utiliser la méthode decode() native qui retourne une Promise
          img.decode()
            .then(() => {
              console.log(`Image décodée avec succès: ${src}`);
              // Attendre un court instant pour s'assurer que l'image est complètement chargée
              setTimeout(() => resolve(src), 100);
            })
            .catch(() => {
              console.error(`Erreur lors du décodage de l'image: ${src}`);
              reject(src);
            });

          img.onload = () => {
            console.log(`Image préchargée avec succès: ${src}`);
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
        setIsLoading(false);
        console.log('Toutes les images ont été préchargées et décodées');
      } catch (error) {
        console.error('Erreur lors du préchargement des images:', error);
        setIsLoading(false);
      }
    };

    preloadImages();
  }, [images]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying && !isLoading && loadedImages.length === images.length) {
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
  }, [isPlaying, images.length, loadedImages.length, isLoading]);

  if (isLoading || loadedImages.length !== images.length) {
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
          key={image}
          src={image}
          index={index}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
        />
      ))}
    </div>
  );
};
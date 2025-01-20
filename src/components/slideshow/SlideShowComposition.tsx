import { useState, useEffect, useRef } from "react";
import { SlideShowImage } from "./SlideShowImage";
import { useToast } from "@/hooks/use-toast";

type SlideShowCompositionProps = {
  images: string[];
  musicUrl?: string;
  isPlaying?: boolean;
  volume?: number;
};

export const SlideShowComposition = ({ 
  images, 
  musicUrl,
  isPlaying = true,
  volume = 1
}: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Gestion du changement d'image
  useEffect(() => {
    // Nettoyage de l'intervalle existant
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    // Création d'un nouvel intervalle uniquement si isPlaying est true
    if (isPlaying) {
      console.log('Starting slideshow interval');
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
    }

    // Nettoyage lors du démontage
    return () => {
      console.log('Cleaning up slideshow interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isPlaying, images.length]); // Dépendances mises à jour

  // Initialisation et gestion de l'audio
  useEffect(() => {
    if (!musicUrl) return;

    const audio = new Audio(musicUrl);
    audio.loop = true;
    audioRef.current = audio;

    const handleError = () => {
      console.error('Erreur audio:', audio.error);
      toast({
        title: "Erreur audio",
        description: "Erreur lors du chargement de l'audio",
        variant: "destructive",
      });
    };

    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [musicUrl, toast]);

  // Gestion de la lecture/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Erreur de lecture:', error);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Gestion du volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = volume === 0;
  }, [volume]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
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
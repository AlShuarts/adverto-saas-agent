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
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Mise à jour du volume avec synchronisation mute
  const updateVolume = () => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = volume === 0;
    }
  };

  // Gestion robuste de la lecture/pause audio
  const handlePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } catch (error) {
      console.error('Erreur de lecture audio:', error);
      toast({
        title: "Erreur audio",
        description: "Impossible de lire l'audio",
        variant: "destructive",
      });
    }
  };

  // Effet pour la gestion de la lecture/pause
  useEffect(() => {
    handlePlayback();
  }, [isPlaying]);

  // Effet pour la gestion du volume
  useEffect(() => {
    updateVolume();
  }, [volume]);

  // Gestion du changement d'image avec nettoyage robuste
  useEffect(() => {
    const cleanupInterval = () => {
      if (intervalRef.current) {
        console.log('Nettoyage de l\'intervalle:', intervalRef.current);
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };

    // Nettoyer l'intervalle existant avant d'en créer un nouveau
    cleanupInterval();

    // Créer un nouvel intervalle uniquement si isPlaying est true
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);

      console.log('Nouvel intervalle créé:', intervalRef.current);
    }

    // Nettoyage lors du démontage ou changement d'état
    return cleanupInterval;
  }, [isPlaying, images.length]);

  // Initialisation et nettoyage de l'audio
  useEffect(() => {
    if (audioRef.current && musicUrl) {
      audioRef.current.src = musicUrl;
      audioRef.current.loop = true;
      
      const handleError = (e: Event) => {
        console.error('Erreur audio:', e);
        toast({
          title: "Erreur audio",
          description: "Erreur lors du chargement de l'audio",
          variant: "destructive",
        });
      };

      audioRef.current.addEventListener('error', handleError);

      // Nettoyage complet
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('error', handleError);
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = '';
        }
      };
    }
  }, [musicUrl, toast]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <audio ref={audioRef} />
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
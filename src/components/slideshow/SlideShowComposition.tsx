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

  // Gestion immédiate du volume
  const updateVolume = () => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // Synchroniser l'état muet avec le volume
      audioRef.current.muted = volume === 0;
    }
  };

  // Gérer la lecture/pause de la musique avec gestion d'erreurs robuste
  const handlePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } catch (error) {
      console.error('Error managing audio playback:', error);
      toast({
        title: "Erreur audio",
        description: "Impossible de contrôler la lecture audio",
        variant: "destructive",
      });
    }
  };

  // Effet pour la gestion de la lecture/pause
  useEffect(() => {
    handlePlayback();
  }, [isPlaying]);

  // Effet pour la gestion du volume avec mise à jour immédiate
  useEffect(() => {
    updateVolume();
  }, [volume]);

  // Gérer le changement d'image avec pause robuste
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, images.length]);

  // Initialiser l'audio avec gestion d'erreurs
  useEffect(() => {
    if (audioRef.current && musicUrl) {
      audioRef.current.src = musicUrl;
      audioRef.current.loop = true;
      
      // Configurer les gestionnaires d'événements audio
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast({
          title: "Erreur audio",
          description: "Erreur lors du chargement de l'audio",
          variant: "destructive",
        });
      });

      // Nettoyer les gestionnaires d'événements
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.removeEventListener('error', () => {});
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
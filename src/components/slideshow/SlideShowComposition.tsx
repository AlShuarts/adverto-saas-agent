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
  const { toast } = useToast();

  // Gérer la lecture/pause de la musique
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing background music:', error);
          toast({
            title: "Erreur",
            description: "Impossible de jouer la musique de fond",
            variant: "destructive",
          });
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, toast]);

  // Gérer le volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Gérer le changement d'image avec pause
  useEffect(() => {
    const changeImage = () => {
      if (isPlaying) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }
    };

    const timer = setInterval(changeImage, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, images.length]);

  // Initialiser l'audio
  useEffect(() => {
    if (audioRef.current && musicUrl) {
      audioRef.current.src = musicUrl;
      audioRef.current.loop = true;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [musicUrl]);

  return (
    <div style={{ flex: 1, backgroundColor: 'black', position: 'relative', width: '100%', height: '100%' }}>
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
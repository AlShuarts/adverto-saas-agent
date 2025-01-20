import { useState, useEffect } from "react";
import { SlideShowImage } from "./SlideShowImage";
import { useToast } from "@/hooks/use-toast";

type SlideShowCompositionProps = {
  images: string[];
  musicUrl?: string;
};

export const SlideShowComposition = ({ images, musicUrl }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audio] = useState(new Audio());
  const { toast } = useToast();

  useEffect(() => {
    if (musicUrl) {
      audio.src = musicUrl;
      audio.loop = true;
      audio.play().catch((error) => {
        console.error('Error playing background music:', error);
        toast({
          title: "Erreur",
          description: "Impossible de jouer la musique de fond",
          variant: "destructive",
        });
      });
    }

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [images.length, audio, musicUrl, toast]);

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
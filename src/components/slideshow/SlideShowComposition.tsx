import { useState, useEffect, useCallback } from "react";
import { SlideShowImage } from "./SlideShowImage";
import { useToast } from "@/hooks/use-toast";
import { continueRender, delayRender } from "@remotion/core";

type SlideShowCompositionProps = {
  images: string[];
  musicUrl?: string;
};

export const SlideShowComposition = ({ images, musicUrl }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audio] = useState(new Audio());
  const [handle] = useState(() => delayRender());
  const { toast } = useToast();

  const setupAudio = useCallback(async () => {
    try {
      if (musicUrl) {
        audio.src = musicUrl;
        audio.loop = true;
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing background music:', error);
      toast({
        title: "Erreur",
        description: "Impossible de jouer la musique de fond",
        variant: "destructive",
      });
    } finally {
      continueRender(handle);
    }
  }, [audio, musicUrl, toast, handle]);

  useEffect(() => {
    setupAudio();

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [images.length, audio, setupAudio]);

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
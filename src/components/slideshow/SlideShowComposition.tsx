import { useState, useEffect } from "react";
import { SlideShowImage } from "./SlideShowImage";
import { getRandomBackgroundMusic } from "./backgroundMusic";
import { useToast } from "@/hooks/use-toast";

type SlideShowCompositionProps = {
  images: string[];
};

export const SlideShowComposition = ({ images }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audio] = useState(new Audio());
  const { toast } = useToast();

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const music = await getRandomBackgroundMusic();
        if (music) {
          audio.src = music.url;
          audio.loop = true;
          audio.volume = 0.3;
          await audio.play();
        } else {
          toast({
            title: "Attention",
            description: "Aucune musique de fond n'est disponible",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error playing background music:', error);
        toast({
          title: "Erreur",
          description: "Impossible de jouer la musique de fond",
          variant: "destructive",
        });
      }
    };

    setupAudio();

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
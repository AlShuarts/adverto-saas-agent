import { useState, useEffect, useCallback } from "react";
import { SlideShowImage } from "./SlideShowImage";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Pause, Play, Volume2 } from "lucide-react";

type SlideShowCompositionProps = {
  images: string[];
  musicUrl?: string;
};

export const SlideShowComposition = ({ images, musicUrl }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState([30]);
  const { toast } = useToast();

  const togglePlayPause = useCallback(() => {
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [audio]);

  const handleVolumeChange = useCallback((values: number[]) => {
    const newVolume = values[0] / 100;
    audio.volume = newVolume;
    setVolume(values);
  }, [audio]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        if (musicUrl) {
          audio.src = musicUrl;
          audio.loop = true;
          audio.volume = volume[0] / 100;
          if (isPlaying) {
            await audio.play();
          }
        } else {
          toast({
            title: "Attention",
            description: "Aucune musique de fond n'est sélectionnée",
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

    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
    }

    return () => {
      if (timer) clearInterval(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [images.length, audio, musicUrl, toast, volume, isPlaying]);

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
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-black/50 p-4 rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          className="text-white hover:text-white/80"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="h-4 w-4 text-white" />
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-32"
          />
        </div>
      </div>
    </div>
  );
};
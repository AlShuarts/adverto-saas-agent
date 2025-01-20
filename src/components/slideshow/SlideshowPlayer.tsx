import { useState, useCallback, useEffect } from "react";
import { SlideShowComposition } from "./SlideShowComposition";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

type SlideshowPlayerProps = {
  images: string[];
  musicUrl: string | null | undefined;
};

export const SlideshowPlayer = ({ images, musicUrl }: SlideshowPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  // Gestion du montage/démontage
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      setIsPlaying(false);
    };
  }, []);

  const togglePlay = useCallback(() => {
    console.log('Toggling play state from:', isPlaying, 'to:', !isPlaying);
    setIsPlaying(prev => !prev);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setVolume(prev => prev === 0 ? 1 : 0);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, []);

  // Ne rendre le composant que s'il est monté et qu'il y a une URL de musique
  if (!isMounted || !musicUrl) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full relative bg-black">
        <SlideShowComposition
          images={images}
          musicUrl={musicUrl}
          isPlaying={isPlaying}
          volume={volume}
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="h-10 w-10"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="h-10 w-10"
        >
          {volume === 0 ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>

        <div className="w-32">
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
};
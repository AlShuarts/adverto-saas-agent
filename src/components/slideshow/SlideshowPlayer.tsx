import { useCallback } from "react";
import { SlideShowComposition } from "./SlideShowComposition";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useSlideshow } from "@/hooks/useSlideshow";

type SlideshowPlayerProps = {
  images: string[];
  musicUrl: string | null | undefined;
};

export const SlideshowPlayer = ({ images, musicUrl }: SlideshowPlayerProps) => {
  const {
    isPlaying,
    volume,
    setIsPlaying,
    setVolume
  } = useSlideshow(images, musicUrl);

  const togglePlay = useCallback(() => {
    console.log('Toggling play state from:', isPlaying, 'to:', !isPlaying);
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const toggleMute = useCallback(() => {
    setVolume(prev => prev === 0 ? 1 : 0);
  }, [setVolume]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
  }, [setVolume]);

  if (!musicUrl) {
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
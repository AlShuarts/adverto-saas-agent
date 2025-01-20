import { Player } from "@remotion/player";
import { SlideShowComposition } from "./SlideShowComposition";

type SlideshowPlayerProps = {
  images: string[];
  musicUrl: string | null | undefined;
};

export const SlideshowPlayer = ({ images, musicUrl }: SlideshowPlayerProps) => {
  return (
    <div className="aspect-video w-full">
      <Player
        component={SlideShowComposition}
        inputProps={{ 
          images,
          musicUrl: musicUrl || undefined
        }}
        durationInFrames={images.length * 60}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
      />
    </div>
  );
};
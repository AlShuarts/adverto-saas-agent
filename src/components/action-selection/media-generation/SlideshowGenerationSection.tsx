
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SlideshowPlayer } from "@/components/slideshow/SlideshowPlayer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageSelection } from "./components/ImageSelection";
import { MusicSelector } from "@/components/slideshow/MusicSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";
import { BackgroundMusic } from "@/components/slideshow/backgroundMusic";
import { ScrollArea } from "@/components/ui/scroll-area";

type SlideshowGenerationSectionProps = {
  isGeneratingSlideshow: boolean;
  slideshowUrl: string | null;
  slideshowError: string | null;
  slideshowRenderId: string | null;
  generateSlideshow: () => Promise<string | null>;
  refetchSlideshowStatus: () => void;
  onRegenerateSlideshow: () => void;
  selectedImages: string[];
  selectedMusic: string | undefined;
  toggleImageSelection: (imageUrl: string) => void;
  availableImages?: string[]; // Add new prop for available images
};

export const SlideshowGenerationSection = ({
  isGeneratingSlideshow,
  slideshowUrl,
  slideshowError,
  slideshowRenderId,
  generateSlideshow,
  refetchSlideshowStatus,
  onRegenerateSlideshow,
  selectedImages,
  selectedMusic,
  toggleImageSelection,
  availableImages // Get available images from props
}: SlideshowGenerationSectionProps) => {
  const handleGenerateClick = async () => {
    await generateSlideshow();
  };

  // Mock music array as strings instead of BackgroundMusic objects
  const mockMusicOptions = ["upbeat", "emotional", "professional"];

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Diaporama</h4>
      
      {!slideshowUrl && !isGeneratingSlideshow && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <ScrollArea className="h-[280px]">
                <ImageSelection 
                  selectedImages={selectedImages}
                  toggleImageSelection={toggleImageSelection}
                  availableImages={availableImages} // Pass available images to ImageSelection
                />
              </ScrollArea>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Musique</h5>
                <MusicSelector 
                  selectedMusic={selectedMusic}
                  musics={mockMusicOptions}
                  onMusicChange={() => {}} // This is a dummy function since we're handling music elsewhere
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGenerateClick}
              disabled={(availableImages && availableImages.length === 0) || selectedImages.length === 0}
              className="w-full"
            >
              Générer le diaporama
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {isGeneratingSlideshow && (
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p>Génération du diaporama en cours...</p>
              <p className="text-xs text-muted-foreground">Cela peut prendre quelques minutes.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {slideshowUrl && (
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardContent className="pt-6 pb-2">
            <SlideshowPlayer 
              images={selectedImages}
              musicUrl={selectedMusic}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onRegenerateSlideshow}
              className="text-xs"
            >
              Régénérer
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {slideshowError && (
        <Alert variant="destructive">
          <AlertDescription>
            {slideshowError}. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

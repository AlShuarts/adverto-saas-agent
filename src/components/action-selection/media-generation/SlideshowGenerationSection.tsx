
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SlideshowPlayer } from "@/components/slideshow/SlideshowPlayer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader, Video } from "lucide-react";

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
  toggleImageSelection?: (imageUrl: string) => void;
  availableImages?: string[];
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
}: SlideshowGenerationSectionProps) => {
  const handleGenerateClick = async () => {
    await generateSlideshow();
  };

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Diaporama</h4>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {!slideshowUrl && !isGeneratingSlideshow && (
              <Button 
                onClick={handleGenerateClick}
                disabled={selectedImages.length === 0}
                className="w-full"
              >
                Générer le diaporama
              </Button>
            )}
            
            {isGeneratingSlideshow && (
              <div className="w-full flex flex-col items-center justify-center p-4 text-center space-y-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p>Génération du diaporama en cours...</p>
                <p className="text-xs text-muted-foreground">Cela peut prendre quelques minutes.</p>
              </div>
            )}
            
            {slideshowRenderId && !slideshowUrl && !isGeneratingSlideshow && (
              <div className="w-full flex flex-col items-center space-y-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Traitement en cours...
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refetchSlideshowStatus}
                >
                  Vérifier le statut
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {slideshowUrl && (
            <div className="w-full flex justify-between">
              <Button 
                variant="outline" 
                onClick={onRegenerateSlideshow}
              >
                Régénérer
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => window.open(slideshowUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Prévisualiser le diaporama
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      
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

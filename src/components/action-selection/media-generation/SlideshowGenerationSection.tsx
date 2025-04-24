
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SlideshowPlayer } from "@/components/slideshow/SlideshowPlayer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader, Video, RefreshCw } from "lucide-react";
import { useState } from "react";

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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const handleGenerateClick = async () => {
    console.log("Générer le diaporama avec la musique:", selectedMusic);
    await generateSlideshow();
  };

  const handleStatusCheck = () => {
    setIsCheckingStatus(true);
    console.log("Vérification manuelle du statut du diaporama");
    
    // Call the refetch function
    refetchSlideshowStatus();
    
    // Reset the checking state after a short delay
    setTimeout(() => {
      setIsCheckingStatus(false);
    }, 2000);
  };

  // Vérifier si nous avons suffisamment d'images
  const hasEnoughImages = selectedImages && selectedImages.length > 0;
  const noImagesWarning = !hasEnoughImages && "Veuillez sélectionner au moins une image";

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Diaporama</h4>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {!slideshowUrl && !isGeneratingSlideshow && !slideshowRenderId && (
              <div className="space-y-4">
                {!hasEnoughImages && (
                  <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-300">
                    <AlertDescription>
                      Veuillez sélectionner au moins une image pour générer un diaporama.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleGenerateClick}
                  disabled={!hasEnoughImages}
                  className="w-full"
                >
                  Générer le diaporama
                </Button>
                
                {selectedMusic && (
                  <p className="text-xs text-muted-foreground text-center">
                    Musique sélectionnée: {selectedMusic}
                  </p>
                )}
              </div>
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
                <p className="text-sm">
                  Traitement en cours...
                </p>
                <p className="text-xs text-muted-foreground">
                  Cela peut prendre 3 à 5 minutes
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStatusCheck}
                    disabled={isCheckingStatus}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    {isCheckingStatus ? 'Vérification...' : 'Vérifier le statut'}
                  </Button>
                </div>
                
                {selectedMusic && (
                  <p className="text-xs text-muted-foreground">
                    Le diaporama sera créé avec la musique: {selectedMusic}
                  </p>
                )}
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

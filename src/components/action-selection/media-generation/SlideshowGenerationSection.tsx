
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play, Pause } from "lucide-react";

type SlideshowGenerationSectionProps = {
  isGeneratingSlideshow: boolean;
  slideshowUrl: string | null;
  slideshowError: string | null;
  slideshowRenderId: string | null;
  generateSlideshow: () => Promise<string | null>;
  refetchSlideshowStatus: () => void;
  onRegenerateSlideshow: () => void;
  selectedImages: string[];
  selectedMusic?: string;
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
  selectedMusic
}: SlideshowGenerationSectionProps) => {
  const [isManualChecking, setIsManualChecking] = React.useState(false);
  
  const handleCheckStatus = () => {
    setIsManualChecking(true);
    refetchSlideshowStatus();
    setTimeout(() => setIsManualChecking(false), 2000);
  };

  // Add debug logging for the selected music
  React.useEffect(() => {
    console.log("SlideshowGenerationSection - selectedMusic:", selectedMusic);
  }, [selectedMusic]);

  const musicName = selectedMusic ? selectedMusic.replace(/\.[^/.]+$/, "") : "";

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Génération du diaporama</h4>
      
      {!slideshowUrl && !isGeneratingSlideshow && !slideshowRenderId && (
        <div className="flex flex-col items-center justify-center py-4">
          <Button 
            onClick={generateSlideshow}
            disabled={selectedImages.length === 0}
            className="w-full"
          >
            Générer le diaporama{selectedMusic ? ` avec musique: ${musicName}` : ""}
          </Button>
        </div>
      )}

      {isGeneratingSlideshow && (
        <div className="w-full flex flex-col items-center justify-center p-4 text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Génération du diaporama en cours...</p>
          <p className="text-xs text-muted-foreground">Cela peut prendre quelques minutes.</p>
        </div>
      )}

      {slideshowRenderId && !slideshowUrl && !isGeneratingSlideshow && (
        <div className="w-full flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Traitement en cours...</p>
          <p className="text-xs text-muted-foreground">Cela peut prendre 3 à 5 minutes</p>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCheckStatus}
            disabled={isManualChecking}
            className="flex items-center gap-2"
          >
            {isManualChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                Vérifier le statut
              </>
            )}
          </Button>
        </div>
      )}

      {slideshowUrl && (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-green-500 flex items-center gap-1">
              <Video className="w-4 h-4" /> Diaporama généré avec succès
            </span>
            <Button 
              variant="outline" 
              onClick={onRegenerateSlideshow}
            >
              Régénérer
            </Button>
          </div>
          
          <div className="border rounded-md p-2 bg-muted/20">
            <div className="flex justify-center">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => window.open(slideshowUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Prévisualiser le diaporama
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {slideshowError && (
        <div className="text-sm text-red-500 mt-2">
          {slideshowError}
        </div>
      )}
    </div>
  );
};

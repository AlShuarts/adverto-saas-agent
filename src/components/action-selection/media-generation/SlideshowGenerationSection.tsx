
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play, Pause } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
    <div className="space-y-3 pb-3 border border-gray-800 rounded-md p-3 bg-gray-900/40">
      <h4 className="text-md font-medium">Génération du diaporama</h4>
      
      {!slideshowUrl && !isGeneratingSlideshow && !slideshowRenderId && (
        <div className="flex flex-col items-center justify-center py-4">
          <Button 
            onClick={generateSlideshow}
            disabled={selectedImages.length === 0}
            className="w-full py-6 md:py-8 text-base md:text-lg"
            size={isMobile ? "default" : "lg"}
          >
            <Video className="w-5 h-5 mr-2 md:w-6 md:h-6 md:mr-3" />
            Générer le diaporama{selectedMusic ? ` avec musique: ${musicName}` : ""}
          </Button>
        </div>
      )}

      {isGeneratingSlideshow && (
        <div className="w-full flex flex-col items-center justify-center p-4 md:p-6 text-center space-y-3">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
          <p>Génération du diaporama en cours...</p>
          <p className="text-xs text-muted-foreground">Cela peut prendre quelques minutes.</p>
        </div>
      )}

      {slideshowRenderId && !slideshowUrl && !isGeneratingSlideshow && (
        <div className="w-full flex flex-col items-center space-y-3 p-4 md:p-6">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Traitement en cours...</p>
          <p className="text-xs text-muted-foreground">Cela peut prendre 3 à 5 minutes</p>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCheckStatus}
            disabled={isManualChecking}
            className="flex items-center gap-2 mt-2"
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
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-green-500 flex items-center gap-1">
              <Video className="w-4 h-4" /> Diaporama généré avec succès
            </span>
            <Button 
              variant="outline" 
              onClick={onRegenerateSlideshow}
              size={isMobile ? "sm" : "default"}
            >
              Régénérer
            </Button>
          </div>
          
          <div className="border rounded-md p-3 bg-muted/20 flex justify-center">
            <Button 
              variant="secondary"
              size={isMobile ? "default" : "lg"}
              onClick={() => window.open(slideshowUrl, '_blank')}
              className="flex items-center gap-2 py-5 md:py-6 text-sm md:text-base w-full max-w-md"
            >
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              Prévisualiser le diaporama
            </Button>
          </div>
        </div>
      )}
      
      {slideshowError && (
        <div className="text-sm text-red-500 mt-2 mb-4 p-3 bg-red-500/10 rounded-md">
          {slideshowError}
        </div>
      )}
    </div>
  );
};

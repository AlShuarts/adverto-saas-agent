import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageSelection } from "./components/ImageSelection";
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
  availableImages?: string[]; // Allow for passing available images
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
  availableImages
}: SlideshowGenerationSectionProps) => {
  const [isManualChecking, setIsManualChecking] = React.useState(false);
  const isMobile = useIsMobile();
  const handleCheckStatus = () => {
    setIsManualChecking(true);
    refetchSlideshowStatus();
    setTimeout(() => setIsManualChecking(false), 2000);
  };
  const musicName = selectedMusic ? selectedMusic.replace(/\.[^/.]+$/, "") : "";
  return <div className="space-y-3 pb-3 border border-gray-800 rounded-md p-3 bg-gray-900/40">
      
      
      {/* Image Selection section - Always show this */}
      {toggleImageSelection && availableImages && <div className="mb-4">
          <ImageSelection selectedImages={selectedImages} toggleImageSelection={toggleImageSelection} availableImages={availableImages} />
        </div>}
      
      {!slideshowUrl && !isGeneratingSlideshow && !slideshowRenderId}

      {isGeneratingSlideshow && <div className="w-full flex flex-col items-center justify-center p-4 md:p-6 text-center space-y-3">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
          <p>Génération du diaporama en cours...</p>
          <p className="text-xs text-muted-foreground">Cela peut prendre quelques minutes.</p>
        </div>}

      {slideshowRenderId && !slideshowUrl && !isGeneratingSlideshow && <div className="w-full flex flex-col items-center space-y-3 p-4 md:p-6">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Traitement en cours...</p>
          <p className="text-xs text-muted-foreground">Cela peut prendre 3 à 5 minutes</p>
          
          <Button variant="outline" size="sm" onClick={handleCheckStatus} disabled={isManualChecking} className="flex items-center gap-2 mt-2">
            {isManualChecking ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification en cours...
              </> : <>
                Vérifier le statut
              </>}
          </Button>
        </div>}

      {slideshowUrl && <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-green-500 flex items-center gap-1">
              <Video className="w-4 h-4" /> Diaporama généré avec succès
            </span>
            <Button variant="outline" onClick={onRegenerateSlideshow} size={isMobile ? "sm" : "default"}>
              Régénérer
            </Button>
          </div>
          
          <div className="border rounded-md p-3 bg-muted/20 flex justify-center">
            <Button variant="secondary" size={isMobile ? "default" : "lg"} onClick={() => window.open(slideshowUrl, '_blank')} className="flex items-center gap-2 py-5 md:py-6 text-sm md:text-base w-full max-w-md">
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              Prévisualiser le diaporama
            </Button>
          </div>
        </div>}
      
      {slideshowError && <div className="text-sm text-red-500 mt-2 mb-4 p-3 bg-red-500/10 rounded-md">
          {slideshowError}
        </div>}
    </div>;
};
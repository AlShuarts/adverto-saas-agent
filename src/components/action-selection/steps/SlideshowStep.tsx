
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play } from "lucide-react";

type SlideshowStepProps = {
  isGeneratingSlideshow: boolean;
  slideshowUrl: string | null;
  slideshowError: string | null;
  slideshowRenderId: string | null;
  selectedImages: string[];
  onGenerateSlideshow: () => void;
  onRegenerateSlideshow: () => void;
  onCheckStatus: () => void;
};

export const SlideshowStep = ({
  isGeneratingSlideshow,
  slideshowUrl,
  slideshowError,
  slideshowRenderId,
  selectedImages,
  onGenerateSlideshow,
  onRegenerateSlideshow,
  onCheckStatus
}: SlideshowStepProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium">Génération du diaporama</h4>
      
      {!slideshowUrl ? (
        <div className="flex flex-col items-center justify-center py-4">
          {isGeneratingSlideshow ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Génération du diaporama en cours...
              </p>
              <p className="text-xs text-muted-foreground">
                Ce processus peut prendre plusieurs minutes.
              </p>
            </div>
          ) : slideshowRenderId && !slideshowError ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Traitement en cours...
              </p>
              <p className="text-xs text-muted-foreground">
                Votre diaporama est en train d'être généré. Veuillez patienter.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onCheckStatus}
              >
                Vérifier le statut
              </Button>
            </div>
          ) : (
            <>
              <Button 
                onClick={onGenerateSlideshow} 
                disabled={isGeneratingSlideshow || selectedImages.length === 0}
                className="w-full"
              >
                {isGeneratingSlideshow ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : "Générer le diaporama"}
              </Button>
              
              {slideshowError && (
                <div className="text-sm text-red-500 mt-2">
                  {slideshowError}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
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
    </div>
  );
};

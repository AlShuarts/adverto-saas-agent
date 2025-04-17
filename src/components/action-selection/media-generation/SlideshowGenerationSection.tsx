
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play, RefreshCw, Music } from "lucide-react";

type SlideshowGenerationSectionProps = {
  isGeneratingSlideshow: boolean;
  slideshowUrl: string | null;
  slideshowError: string | null;
  slideshowRenderId: string | null;
  generateSlideshow: () => Promise<string | null>;
  refetchSlideshowStatus: () => void;
  selectedImages: string[];
  selectedMusic?: string | undefined;
  onRegenerateSlideshow: () => void;
};

export const SlideshowGenerationSection = ({
  isGeneratingSlideshow,
  slideshowUrl,
  slideshowError,
  slideshowRenderId,
  generateSlideshow,
  refetchSlideshowStatus,
  selectedImages,
  selectedMusic,
  onRegenerateSlideshow
}: SlideshowGenerationSectionProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium flex items-center space-x-2">
        <Video size={18} className="text-primary" />
        <span>Génération du diaporama</span>
        {selectedMusic && (
          <div className="ml-auto flex items-center text-xs text-muted-foreground">
            <Music className="h-3 w-3 mr-1" />
            <span>Musique: {selectedMusic}</span>
          </div>
        )}
      </h4>
      
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
                onClick={() => refetchSlideshowStatus()}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                <span>Vérifier le statut</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="w-full space-y-4">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {selectedImages.slice(0, 4).map((img, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden border border-muted">
                      <img src={img} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={generateSlideshow} 
                  disabled={isGeneratingSlideshow || selectedImages.length === 0}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isGeneratingSlideshow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : "Générer le diaporama"}
                </Button>
                
                {selectedImages.length === 0 && (
                  <p className="text-sm text-amber-500 text-center">
                    Veuillez sélectionner des images pour générer un diaporama
                  </p>
                )}
              </div>
              
              {slideshowError && (
                <div className="text-sm text-red-500 mt-2 p-2 bg-red-500/10 rounded-md w-full text-center">
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
          
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="aspect-video bg-black rounded-md overflow-hidden mb-3">
              <video 
                src={slideshowUrl} 
                className="w-full h-full object-cover"
                controls
                autoPlay={false}
                muted
              />
            </div>
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

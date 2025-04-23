import { Button } from "@/components/ui/button";
import { Video, Loader2, Tag } from "lucide-react";
import { ImageSelection } from "./components/ImageSelection";
import { MusicSelector } from "@/components/slideshow/MusicSelector";

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
  toggleImageSelection: (imageUrl: string) => void; // Add this missing prop
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
  toggleImageSelection // Now the prop is included
}: SlideshowGenerationSectionProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4 bg-gray-900">
      <h4 className="font-medium flex items-center space-x-2 text-white">
        <Video size={18} className="text-primary" />
        <span>Configuration du diaporama</span>
      </h4>
      
      <div className="space-y-4">
        <div className="space-y-2 border rounded-md p-4 bg-gray-800">
          <h3 className="text-base font-medium text-white">Images</h3>
          {selectedImages && selectedImages.length > 0 ? (
            <ImageSelection
              images={selectedImages}
              selectedImages={selectedImages}
              toggleImageSelection={toggleImageSelection}
            />
          ) : (
            <div className="text-center p-4 bg-gray-700/50 rounded-md">
              <p className="text-gray-300">
                Aucune image disponible. Veuillez sélectionner des images à l'étape précédente.
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-2 border rounded-md p-4 bg-gray-800">
          <h3 className="text-base font-medium text-white">Musique</h3>
          <MusicSelector selectedMusic={selectedMusic} />
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-4 mt-6">
        {!slideshowUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            {isGeneratingSlideshow ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Création du diaporama en cours...
                </p>
              </div>
            ) : slideshowRenderId ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  <p className="text-amber-500 font-medium">Diaporama en cours de génération</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  La création de votre diaporama est en cours de traitement. Cela peut prendre quelques minutes.
                </p>
                <Button 
                  variant="outline"
                  onClick={refetchSlideshowStatus}
                  className="mt-2"
                >
                  Vérifier le statut
                </Button>
              </div>
            ) : (
              <Button 
                onClick={generateSlideshow} 
                disabled={isGeneratingSlideshow}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGeneratingSlideshow ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : "Générer le diaporama"}
              </Button>
            )}
            
            {slideshowError && (
              <div className="mt-4 text-red-500 text-sm">
                Erreur: {slideshowError}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-500 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Diaporama généré avec succès
              </span>
              <Button 
                variant="outline"
                onClick={onRegenerateSlideshow}
              >
                Régénérer
              </Button>
            </div>
            
            <div className="border rounded-md p-3 bg-muted/20">
              <video 
                src={slideshowUrl} 
                controls 
                className="w-full aspect-video shadow-md rounded-sm" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

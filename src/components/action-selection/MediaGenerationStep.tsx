
import { Button } from "@/components/ui/button";
import { Loader2, Tag, Video, Play } from "lucide-react";
import { FormError } from "@/components/banner/FormError";

type MediaGenerationStepProps = {
  selectedPublicationTypes: Array<"photo" | "slideshow" | "banner">;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  formErrors: {[key: string]: string};
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  selectedImages: string[];
  refetchSlideshowStatus: () => void;
};

export const MediaGenerationStep = ({
  selectedPublicationTypes,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowUrl,
  bannerUrl,
  slideshowError,
  bannerError,
  slideshowRenderId,
  formErrors,
  generateSlideshow,
  generateBanner,
  selectedImages,
  refetchSlideshowStatus,
}: MediaGenerationStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 3.5: Génération des médias</h3>
      
      {selectedPublicationTypes.includes("slideshow") && (
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
                    onClick={() => refetchSlideshowStatus()}
                  >
                    Vérifier le statut
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={generateSlideshow} 
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
                  onClick={() => {
                    // This would reset the slideshow state in the parent
                  }}
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
      )}
      
      {selectedPublicationTypes.includes("banner") && (
        <div className="space-y-4 border rounded-md p-4">
          <h4 className="font-medium">Génération de la bannière</h4>
          
          {!bannerUrl ? (
            <div className="flex flex-col items-center justify-center py-4">
              {isGeneratingBanner ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Création de la bannière en cours...
                  </p>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={generateBanner} 
                    disabled={isGeneratingBanner}
                    className="w-full"
                  >
                    {isGeneratingBanner ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : "Générer la bannière"}
                  </Button>
                  
                  {Object.entries(formErrors).length > 0 && (
                    <div className="text-sm text-red-500 mt-2">
                      Veuillez remplir correctement tous les champs requis à l'étape précédente.
                    </div>
                  )}
                  
                  {bannerError && (
                    <div className="text-sm text-red-500 mt-2">
                      {bannerError}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-green-500 flex items-center gap-1">
                  <Tag className="w-4 h-4" /> Bannière générée avec succès
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // This would reset the banner state in the parent
                  }}
                >
                  Régénérer
                </Button>
              </div>
              
              <div className="border rounded-md p-2 bg-muted/20">
                <img src={bannerUrl} alt="Bannière générée" className="max-h-[200px] mx-auto" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

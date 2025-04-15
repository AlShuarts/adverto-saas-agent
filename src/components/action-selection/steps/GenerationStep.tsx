
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PublicationType, SocialNetworks } from "../types";

type GenerationStepProps = {
  selectedPublicationTypes: PublicationType[];
  selectedNetworks: SocialNetworks;
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "À VENDRE";
  selectedMusic?: string;
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowRenderId: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  setFormErrors: (errors: {[key: string]: string}) => void;
  onRegenerateSlideshow?: () => void;
  onRegenerateBanner?: () => void;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  refetchSlideshowStatus: () => void;
};

export const GenerationStep = ({
  selectedPublicationTypes,
  selectedNetworks,
  selectedImages,
  bannerImage,
  bannerType,
  selectedMusic,
  generateSlideshow,
  generateBanner,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowRenderId,
  slideshowError,
  bannerError,
  brokerImageUrl,
  agencyLogoUrl,
  brokerName,
  brokerEmail,
  brokerPhone,
  setFormErrors,
  onRegenerateSlideshow,
  onRegenerateBanner,
  slideshowUrl,
  bannerUrl,
  refetchSlideshowStatus
}: GenerationStepProps) => {
  const [generationStep, setGenerationStep] = useState<"none" | "slideshow" | "banner">("none");
  
  const handleGenerateSlideshow = async () => {
    await generateSlideshow();
  };
  
  const handleGenerateBanner = async () => {
    await generateBanner();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 4: Générer les médias</h3>
      
      <div className="space-y-4">
        {selectedPublicationTypes.includes("slideshow") && (
          <div className="p-4 border rounded-md">
            <h4 className="font-medium">Génération du diaporama</h4>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Générer un diaporama à partir des photos sélectionnées.
            </p>
            <Button 
              type="button" 
              onClick={handleGenerateSlideshow} 
              disabled={isGeneratingSlideshow || selectedImages.length === 0}
              className="w-full sm:w-auto"
            >
              {isGeneratingSlideshow ? "Génération en cours..." : "Générer le diaporama"}
            </Button>
            
            {slideshowRenderId && (
              <p className="text-sm text-green-600 mt-2">
                Diaporama en cours de génération...
              </p>
            )}
            
            {slideshowError && (
              <p className="text-sm text-red-500 mt-2">{slideshowError}</p>
            )}
          </div>
        )}
        
        {selectedPublicationTypes.includes("banner") && (
          <div className="p-4 border rounded-md">
            <h4 className="font-medium">Génération de la bannière</h4>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Générer une bannière avec l'image et les informations du courtier.
            </p>
            <Button 
              type="button" 
              onClick={handleGenerateBanner} 
              disabled={isGeneratingBanner || !bannerImage}
              className="w-full sm:w-auto"
            >
              {isGeneratingBanner ? "Génération en cours..." : "Générer la bannière"}
            </Button>
            
            {bannerError && (
              <p className="text-sm text-red-500 mt-2">{bannerError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

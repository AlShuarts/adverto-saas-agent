
import { PublicationType, SocialNetworks } from './types';

export const useNavigationUtils = (
  currentStep: number,
  setCurrentStep: (step: number) => void,
  selectedPublicationTypes: PublicationType[],
  selectedImages: string[],
  bannerImage: string | null,
  selectedNetworks: SocialNetworks,
  generatedText: string,
  slideshowUrl: string | null,
  bannerUrl: string | null
) => {
  const canGoToNextStep = (): boolean => {
    switch (currentStep) {
      case 1: 
        return selectedPublicationTypes.length > 0;
      case 2: 
        return true;
      case 3: 
        // Si on a sélectionné slideshow ou banner, on vérifie que la génération est faite
        const needsSlideshow = selectedPublicationTypes.includes("slideshow");
        const needsBanner = selectedPublicationTypes.includes("banner");
        
        const slideshowReady = !needsSlideshow || !!slideshowUrl;
        const bannerReady = !needsBanner || !!bannerUrl;
        
        return slideshowReady && bannerReady;
      case 4: 
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    // Si on est à l'étape 2 et qu'on n'a pas sélectionné slideshow ni banner
    if (currentStep === 2 && 
        !selectedPublicationTypes.includes("slideshow") && 
        !selectedPublicationTypes.includes("banner")) {
      // On passe directement à l'étape 4
      setCurrentStep(4);
    } else if (currentStep === 2) {
      // Sinon on passe à l'étape 3
      setCurrentStep(3);
    } else {
      // Dans les autres cas, progression normale
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    // Si on est à l'étape 4 et qu'on vient de l'étape 2 (car pas de slideshow/banner)
    if (currentStep === 4 && 
        !selectedPublicationTypes.includes("slideshow") && 
        !selectedPublicationTypes.includes("banner")) {
      setCurrentStep(2);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    canGoToNextStep,
    nextStep,
    prevStep
  };
};

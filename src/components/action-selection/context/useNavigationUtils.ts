
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
    // Si on est à l'étape 2 et qu'on a seulement des photos et un texte (pas de slideshow ni banner)
    if (currentStep === 2 && 
        !selectedPublicationTypes.includes("slideshow") && 
        !selectedPublicationTypes.includes("banner")) {
      // On passe directement à l'étape 5 (réseaux sociaux)
      setCurrentStep(5);
    } else if (currentStep === 2) {
      // Sinon on passe à l'étape 3 (sélection des médias)
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // De l'étape 3 on passe à l'étape 4 (génération des médias)
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // De l'étape 4 on passe à l'étape 5 (réseaux sociaux)
      setCurrentStep(5);
    } else {
      // Dans les autres cas, progression normale
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    // Si on est à l'étape 5 et qu'on n'a pas de slideshow/banner, on retourne à l'étape 2
    if (currentStep === 5 && 
        !selectedPublicationTypes.includes("slideshow") && 
        !selectedPublicationTypes.includes("banner")) {
      setCurrentStep(2);
    } else if (currentStep === 5) {
      // Si on est à l'étape 5 avec slideshow/banner, on retourne à l'étape 4
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Si on est à l'étape 4, on retourne à l'étape 3
      setCurrentStep(3);
    } else {
      // Sinon on recule normalement d'une étape
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    canGoToNextStep,
    nextStep,
    prevStep
  };
};

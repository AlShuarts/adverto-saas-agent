
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
        // Always allow proceeding from step 2 to generation step (3.5)
        return true;
      case 3.5: 
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
    if (currentStep === 2) {
      const needsGeneration = selectedPublicationTypes.includes("slideshow") || selectedPublicationTypes.includes("banner");
      if (needsGeneration) {
        setCurrentStep(3.5);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 3.5) {
      setCurrentStep(4);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 3.5) {
      setCurrentStep(2);
    } else if (currentStep === 4 && 
              (selectedPublicationTypes.includes("slideshow") || 
               selectedPublicationTypes.includes("banner"))) {
      setCurrentStep(3.5);
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

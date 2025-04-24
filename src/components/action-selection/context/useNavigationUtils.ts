
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
        // For slideshow or banner, we only need image selection to move forward
        // The actual generation will happen in step 4
        return selectedImages.length > 0 || 
               (selectedPublicationTypes.includes("banner") && !!bannerImage);
      case 4: 
        const needsSlideshow = selectedPublicationTypes.includes("slideshow");
        const needsBanner = selectedPublicationTypes.includes("banner");
        
        const slideshowReady = !needsSlideshow || !!slideshowUrl;
        const bannerReady = !needsBanner || !!bannerUrl;
        
        return slideshowReady && bannerReady;
      case 5:
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3 && 
        !selectedPublicationTypes.includes("slideshow") && 
        !selectedPublicationTypes.includes("banner")) {
      setCurrentStep(5);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 5 && 
        !selectedPublicationTypes.includes("slideshow") && 
        !selectedPublicationTypes.includes("banner")) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(3);
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

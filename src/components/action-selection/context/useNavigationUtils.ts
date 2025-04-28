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
        const hasImages = selectedImages.length > 0;
        const hasBannerImage = selectedPublicationTypes.includes("banner") && !!bannerImage;
        
        if (selectedPublicationTypes.includes("slideshow") || selectedPublicationTypes.includes("banner")) {
          const needsSlideshow = selectedPublicationTypes.includes("slideshow");
          const needsBanner = selectedPublicationTypes.includes("banner");
          
          const slideshowReady = !needsSlideshow || !!slideshowUrl;
          const bannerReady = !needsBanner || !!bannerUrl;
          
          return (hasImages || hasBannerImage) && slideshowReady && bannerReady;
        } else {
          return hasImages || true;
        }
      case 4:
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    canGoToNextStep,
    nextStep,
    prevStep
  };
};

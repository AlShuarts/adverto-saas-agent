
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
        // Only check for image selection in step 3
        // We'll handle content generation directly in this step
        const hasImages = selectedImages.length > 0;
        const hasBannerImage = selectedPublicationTypes.includes("banner") && !!bannerImage;
        
        if (selectedPublicationTypes.includes("slideshow") || selectedPublicationTypes.includes("banner")) {
          // For slideshow/banner, check if we've already generated the content
          const needsSlideshow = selectedPublicationTypes.includes("slideshow");
          const needsBanner = selectedPublicationTypes.includes("banner");
          
          const slideshowReady = !needsSlideshow || !!slideshowUrl;
          const bannerReady = !needsBanner || !!bannerUrl;
          
          return (hasImages || hasBannerImage) && slideshowReady && bannerReady;
        } else {
          // For text and photos only, just need images
          return hasImages || true;
        }
      case 5:
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Skip step 4 entirely and go straight to social networks step
      setCurrentStep(5);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 5) {
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

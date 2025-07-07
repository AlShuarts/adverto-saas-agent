
import { PublicationType, PhotoType, SocialNetworks } from './types';

export const useNavigationUtils = (
  currentStep: number,
  setCurrentStep: (step: number) => void,
  selectedPublicationType: PublicationType | null,
  selectedPhotoType: PhotoType | null,
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
        return selectedPublicationType !== null;
      case 2: 
        // Only required if publication type is "photo"
        return selectedPublicationType !== "photo" || selectedPhotoType !== null;
      case 3: 
        return true; // Template step, always can proceed
      case 4: 
        // Media step validation
        const hasImages = selectedImages.length > 0;
        const hasBannerImage = selectedPhotoType === "banner" && !!bannerImage;
        
        if (selectedPublicationType === "slideshow") {
          return hasImages && !!slideshowUrl;
        } else if (selectedPhotoType === "banner") {
          return hasBannerImage && !!bannerUrl;
        } else {
          // listing_photos
          return hasImages;
        }
      case 5:
        // Generation step - check if content is ready
        const hasContent = selectedPublicationType === "slideshow" 
          ? !!slideshowUrl 
          : selectedPhotoType === "banner" 
            ? !!bannerUrl 
            : selectedImages.length > 0;
        return hasContent;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      // If slideshow is selected, skip photo type step
      if (selectedPublicationType === "slideshow") {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 3 && selectedPublicationType === "slideshow") {
      // Skip photo type step when going back from slideshow
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    canGoToNextStep,
    nextStep,
    prevStep
  };
};

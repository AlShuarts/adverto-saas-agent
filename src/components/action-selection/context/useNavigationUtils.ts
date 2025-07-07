
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
  bannerUrl: string | null,
  setSelectedPublicationType: (type: PublicationType | null) => void,
  setSelectedPhotoType: (type: PhotoType | null) => void
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
        // Media step validation - require content to be generated
        const hasImages = selectedImages.length > 0;
        const hasBannerImage = selectedPhotoType === "banner" && !!bannerImage;
        
        if (selectedPublicationType === "slideshow") {
          return hasImages && !!slideshowUrl; // Require slideshow to be generated
        } else if (selectedPhotoType === "banner") {
          return hasBannerImage && !!bannerUrl; // Require banner to be generated
        } else {
          // listing_photos
          return hasImages;
        }
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
    } else if (currentStep === 4) {
      // Skip directly to social step since generation is done at media step
      setCurrentStep(6);
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 3 && selectedPublicationType === "slideshow") {
      // Skip photo type step when going back from slideshow and reset selections
      setSelectedPublicationType(null);
      setSelectedPhotoType(null);
      setCurrentStep(1);
    } else if (currentStep === 6) {
      // Go back to media step
      setCurrentStep(4);
    } else if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      // Reset selections when going back to step 1
      if (newStep === 1) {
        setSelectedPublicationType(null);
        setSelectedPhotoType(null);
      }
    }
  };

  return {
    canGoToNextStep,
    nextStep,
    prevStep
  };
};

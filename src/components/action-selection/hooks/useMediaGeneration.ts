
import { useSlideshowGeneration } from "./generation/useSlideshowGeneration";
import { useBannerGeneration } from "./generation/useBannerGeneration";

export const useMediaGeneration = (listingId: string) => {
  const {
    isGeneratingSlideshow,
    slideshowUrl,
    slideshowError,
    slideshowRenderId,
    setSlideshowUrl,
    setIsGeneratingSlideshow,
    setSlideshowRenderId,
    generateSlideshow
  } = useSlideshowGeneration(listingId);

  const {
    isGeneratingBanner,
    bannerUrl,
    bannerError,
    setBannerUrl,
    setIsGeneratingBanner, // Added this missing setter that needs to be exposed
    generateBanner
  } = useBannerGeneration(listingId);

  return {
    isGeneratingSlideshow,
    isGeneratingBanner,
    slideshowUrl,
    bannerUrl,
    slideshowError,
    bannerError,
    slideshowRenderId,
    setSlideshowUrl,
    setBannerUrl,
    setIsGeneratingSlideshow,
    setIsGeneratingBanner, // Exposed this setter
    setSlideshowRenderId,
    generateSlideshow,
    generateBanner
  };
};

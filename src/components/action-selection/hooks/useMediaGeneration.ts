
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
    setSlideshowRenderId,
    generateSlideshow,
    generateBanner
  };
};


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
    renderId: bannerRenderId,
    setRenderId: setBannerRenderId,
    setBannerUrl,
    setIsGeneratingBanner,
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
    bannerRenderId,
    setSlideshowUrl,
    setBannerUrl,
    setIsGeneratingSlideshow,
    setIsGeneratingBanner,
    setSlideshowRenderId,
    setBannerRenderId,
    generateSlideshow,
    generateBanner
  };
};

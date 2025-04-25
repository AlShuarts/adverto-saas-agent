
import { useState } from 'react';
import { useMediaSelection } from './useMediaSelection';
import { useMediaGeneration } from './useMediaGeneration';
import { useMediaGenerationHandlers } from './useMediaGenerationHandlers';

export const useMediaState = (listingId: string) => {
  const {
    selectedImages,
    setSelectedImages,
    bannerType,
    setBannerType,
    bannerImage,
    setBannerImage,
    resetMediaSelection,
    toggleImageSelection,
    onDragEnd,
    selectBannerImage
  } = useMediaSelection();

  const {
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
  } = useMediaGeneration(listingId);

  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);

  const handleGenerateSlideshow = async () => {
    console.log("Generating slideshow with selected music:", selectedMusic);
    if (selectedImages.length === 0) {
      return;
    }

    return await generateSlideshow({
      selectedImages,
      selectedMusic
    });
  };

  const { handleGenerateBanner } = useMediaGenerationHandlers(
    listingId,
    selectedImages,
    selectedMusic,
    slideshowRenderId,
    setSlideshowUrl,
    setIsGeneratingSlideshow,
    generateSlideshow,
    generateBanner
  );

  return {
    selectedImages,
    setSelectedImages,
    bannerType,
    setBannerType,
    bannerImage,
    setBannerImage,
    resetMediaSelection,
    toggleImageSelection,
    onDragEnd,
    selectBannerImage,
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
    selectedMusic,
    setSelectedMusic,
    handleGenerateSlideshow,
    handleGenerateBanner
  };
};

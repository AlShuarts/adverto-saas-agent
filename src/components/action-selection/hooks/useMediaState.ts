
import { useState } from 'react';
import { useMediaSelection } from './useMediaSelection';
import { useMediaGeneration } from './useMediaGeneration';
import { useMediaGenerationHandlers } from './useMediaGenerationHandlers';
import { useAudioControls } from '@/hooks/useAudioControls';
import { supabase } from "@/integrations/supabase/client";

export const useMediaState = (listingId: string) => {
  const {
    selectedFacebookImages,
    setSelectedFacebookImages,
    selectedInstagramImages,
    setSelectedInstagramImages,
    bannerType,
    setBannerType,
    bannerImage,
    setBannerImage,
    resetMediaSelection,
    toggleFacebookImageSelection,
    toggleInstagramImageSelection,
    selectAllFacebookImages,
    selectAllInstagramImages,
    deselectAllFacebookImages,
    deselectAllInstagramImages,
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

  // Let's remove the duplicate state management for music
  // since it's now handled in useAudioPlayer
  const { currentlyPlaying, playAudio, stopAudio } = useAudioControls();
  
  // Get the selectedMusic from the parent component
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);

  const handleGenerateSlideshow = async () => {
    console.log("Generating slideshow with selected images and music:", selectedMusic);
    // For slideshow, use Facebook images by default or combine both
    const imagesToUse = selectedFacebookImages.length > 0 ? selectedFacebookImages : selectedInstagramImages;
    if (imagesToUse.length === 0) {
      return null;
    }

    return await generateSlideshow(imagesToUse, selectedMusic);
  };

  const { handleGenerateBanner } = useMediaGenerationHandlers(
    listingId,
    selectedFacebookImages, // Use Facebook images for banner generation
    selectedMusic, // Pass selectedMusic here
    slideshowRenderId,
    setSlideshowUrl,
    setIsGeneratingSlideshow,
    generateSlideshow,
    generateBanner
  );

  return {
    selectedFacebookImages,
    setSelectedFacebookImages,
    selectedInstagramImages,
    setSelectedInstagramImages,
    bannerType,
    setBannerType,
    bannerImage,
    setBannerImage,
    resetMediaSelection,
    toggleFacebookImageSelection,
    toggleInstagramImageSelection,
    selectAllFacebookImages,
    selectAllInstagramImages,
    deselectAllFacebookImages,
    deselectAllInstagramImages,
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
    handleGenerateSlideshow,
    handleGenerateBanner,
    currentlyPlaying,
    stopAudio,
    selectedMusic,
    setSelectedMusic
  };
};

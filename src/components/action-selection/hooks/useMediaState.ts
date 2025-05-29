
import { useState } from 'react';
import { useMediaSelection } from './useMediaSelection';
import { useMediaGeneration } from './useMediaGeneration';
import { useMediaGenerationHandlers } from './useMediaGenerationHandlers';
import { useAudioControls } from '@/hooks/useAudioControls';
import { supabase } from "@/integrations/supabase/client";

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
    selectAllImages,
    deselectAllImages,
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

  // Let's remove the duplicate state management for music
  // since it's now handled in useAudioPlayer
  const { currentlyPlaying, playAudio, stopAudio } = useAudioControls();
  
  // Get the selectedMusic from the parent component
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);

  const handleGenerateSlideshow = async () => {
    console.log("Generating slideshow with selected images and music:", selectedMusic);
    if (selectedImages.length === 0) {
      return null;
    }

    return await generateSlideshow(selectedImages, selectedMusic);
  };

  const { handleGenerateBanner } = useMediaGenerationHandlers(
    listingId,
    selectedImages,
    selectedMusic, // Pass selectedMusic here
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
    selectAllImages,
    deselectAllImages,
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
    handleGenerateSlideshow,
    handleGenerateBanner,
    currentlyPlaying,
    stopAudio,
    selectedMusic,
    setSelectedMusic
  };
};

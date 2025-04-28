import { useState } from 'react';
import { useMediaSelection } from './useMediaSelection';
import { useMediaGeneration } from './useMediaGeneration';
import { useMediaGenerationHandlers } from './useMediaGenerationHandlers';
import { useAudioPlayer } from './useAudioPlayer';

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

  const { 
    currentlyPlaying, 
    musicList, 
    selectedMusic, 
    setSelectedMusic,
    stopAudio,
    handleMusicChange: handleMusicChangeAudio,
    previewMusic 
  } = useAudioPlayer();

  const handleMusicChange = (value: string) => {
    console.log("Music selection changed in MediaState:", value);
    handleMusicChangeAudio(value);
  };

  const handleGenerateSlideshow = async () => {
    console.log("Generating slideshow with selected images and music:", {
      imageCount: selectedImages.length,
      selectedMusic
    });
    
    if (selectedImages.length === 0) {
      return null;
    }

    return await generateSlideshow(selectedImages, selectedMusic);
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
    handleGenerateSlideshow,
    handleGenerateBanner,
    currentlyPlaying,
    musicList,
    selectedMusic,
    setSelectedMusic,
    stopAudio,
    handleMusicChange,
    previewMusic
  };
};

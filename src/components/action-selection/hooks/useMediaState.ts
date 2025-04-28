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
  const { currentlyPlaying, playAudio, stopAudio } = useAudioControls();

  const handleMusicChange = (value: string) => {
    console.log("Music selection changed to:", value);
    stopAudio();
    setSelectedMusic(value);
  };

  const previewMusic = (musicName: string) => {
    console.log("Attempting to preview music:", musicName);
    if (currentlyPlaying === musicName) {
      console.log("Stopping current music preview");
      stopAudio();
      return;
    }

    try {
      const publicUrl = supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl;
      console.log("Playing music preview from URL:", publicUrl);
      playAudio(musicName, publicUrl, 0.5);
    } catch (error) {
      console.error("Error setting up audio playback:", error);
    }
  };

  const handleGenerateSlideshow = async () => {
    console.log("Generating slideshow with selected music:", selectedMusic);
    if (selectedImages.length === 0) {
      return;
    }

    // Fix: Pass the parameters directly instead of as an object
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
    selectedMusic,
    setSelectedMusic,
    currentlyPlaying,
    handleMusicChange,
    previewMusic,
    handleGenerateSlideshow,
    handleGenerateBanner
  };
};

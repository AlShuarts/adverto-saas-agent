
import { useState } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { PublicationType } from './types';
import { useTemplates } from '../hooks/useTemplates';
import { useTextGeneration } from '../hooks/useTextGeneration';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMediaGeneration } from '../hooks/useMediaGeneration';
import { useMediaSelection } from '../hooks/useMediaSelection';
import { useBrokerInfo } from '../hooks/useBrokerInfo';
import { useSocialNetworkSelection } from '../hooks/useSocialNetworkSelection';
import { useInitialization } from '../hooks/useInitialization';
import { usePublicationTypeHandler } from '../hooks/usePublicationTypeHandler';
import { useMediaGenerationHandlers } from '../hooks/useMediaGenerationHandlers';

export const useActionSelectionState = (listing: Tables<"listings">) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Import custom hooks
  const { 
    facebookTemplates, 
    instagramTemplates, 
    selectedFacebookTemplateId, 
    selectedInstagramTemplateId,
    setSelectedFacebookTemplateId,
    setSelectedInstagramTemplateId,
    fetchTemplates,
    resetTemplates
  } = useTemplates();
  
  const {
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText
  } = useTextGeneration(listing);
  
  const {
    audioPlaying,
    currentlyPlaying,
    musicList,
    selectedMusic,
    fetchMusic,
    handleMusicChange,
    previewMusic,
    stopAudio
  } = useAudioPlayer();
  
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
  } = useMediaGeneration(listing.id);

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
    brokerImageUrl,
    setBrokerImageUrl,
    agencyLogoUrl,
    setAgencyLogoUrl,
    brokerName,
    setBrokerName,
    brokerEmail,
    setBrokerEmail,
    brokerPhone,
    setBrokerPhone,
    formErrors,
    setFormErrors,
    resetBrokerInfo,
    validateBrokerInfo
  } = useBrokerInfo();

  const {
    selectedNetworks,
    setSelectedNetworks,
    resetNetworks,
    handleNetworkChange
  } = useSocialNetworkSelection();

  const { 
    selectedPublicationTypes, 
    setSelectedPublicationTypes, 
    handlePublicationTypeChange 
  } = usePublicationTypeHandler();

  const { handleGenerateSlideshow, handleGenerateBanner } = useMediaGenerationHandlers(
    listing.id,
    selectedImages,
    selectedMusic,
    slideshowRenderId,
    setSlideshowUrl,
    setIsGeneratingSlideshow,
    generateSlideshow,
    generateBanner
  );
  
  // Initialize and reset
  const resetState = () => {
    setCurrentStep(1);
    setSelectedPublicationTypes([]);
    resetTemplates();
    resetMediaSelection(listing.images?.[0] || null);
    resetNetworks();
    resetBrokerInfo();
    setGeneratedText("");
    setSlideshowUrl(null);
    setBannerUrl(null);
  };

  useInitialization(listing, resetState, fetchTemplates, fetchMusic);

  return {
    // State
    currentStep,
    setCurrentStep,
    selectedPublicationTypes,
    
    // From hooks
    facebookTemplates,
    instagramTemplates,
    selectedFacebookTemplateId,
    selectedInstagramTemplateId,
    setSelectedFacebookTemplateId,
    setSelectedInstagramTemplateId,
    resetTemplates,
    
    isGeneratingText,
    generatedText,
    setGeneratedText,
    
    audioPlaying,
    currentlyPlaying,
    musicList,
    selectedMusic,
    handleMusicChange,
    previewMusic,
    stopAudio,
    
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
    
    selectedImages,
    setSelectedImages,
    bannerType,
    setBannerType,
    bannerImage,
    toggleImageSelection,
    onDragEnd,
    selectBannerImage,
    
    brokerImageUrl,
    setBrokerImageUrl,
    agencyLogoUrl,
    setAgencyLogoUrl,
    brokerName,
    setBrokerName,
    brokerEmail,
    setBrokerEmail,
    brokerPhone,
    setBrokerPhone,
    formErrors,
    setFormErrors,
    
    selectedNetworks,
    setSelectedNetworks,
    handleNetworkChange,
    
    handlePublicationTypeChange,
    handleGenerateText: () => generateText(selectedFacebookTemplateId, facebookTemplates),
    handleGenerateSlideshow,
    handleGenerateBanner: (bannerImage: string | null, bannerType: "VENDU" | "A_VENDRE", brokerInfo: any) => 
      handleGenerateBanner(bannerImage, bannerType, brokerInfo, validateBrokerInfo, setFormErrors)
  };
};

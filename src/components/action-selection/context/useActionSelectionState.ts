
import { useState, useEffect } from 'react';
import { PublicationType } from './types';
import { Tables } from "@/integrations/supabase/types";
import { useTemplates } from '../hooks/useTemplates';
import { useTextGeneration } from '../hooks/useTextGeneration';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMediaGeneration } from '../hooks/useMediaGeneration';
import { useMediaSelection } from '../hooks/useMediaSelection';
import { useBrokerInfo } from '../hooks/useBrokerInfo';
import { useSocialNetworkSelection } from '../hooks/useSocialNetworkSelection';

export const useActionSelectionState = (listing: Tables<"listings">) => {
  // Initialize state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  
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
    setSlideshowUrl,
    setBannerUrl,
    setIsGeneratingSlideshow,
    setIsGeneratingBanner,
    setSlideshowRenderId,
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
  
  // Initialize and reset
  useEffect(() => {
    resetState();
    fetchTemplates();
    fetchMusic();
  }, [listing.images]);
  
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
  
  // Publication type handler
  const handlePublicationTypeChange = (type: PublicationType, checked: boolean) => {
    setSelectedPublicationTypes(prev => 
      checked 
        ? [...prev, type] 
        : prev.filter(t => t !== type)
    );
  };
  
  // Text generation handler
  const handleGenerateText = async () => {
    await generateText(selectedFacebookTemplateId, facebookTemplates);
  };

  // Slideshow generation handler
  const handleGenerateSlideshow = async (): Promise<string | null> => {
    return await generateSlideshow(selectedImages, selectedMusic);
  };
  
  // Banner generation handler
  const handleGenerateBanner = async (): Promise<{ success?: boolean; errors?: Record<string, string> }> => {
    // Validation
    const errors = validateBrokerInfo();
    
    if (!bannerImage) {
      errors.bannerImage = "Veuillez sélectionner une image pour la bannière";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return { errors };
    }

    return await generateBanner(
      bannerImage,
      bannerType,
      {
        brokerImageUrl,
        agencyLogoUrl,
        brokerName,
        brokerEmail,
        brokerPhone
      }
    );
  };

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
    setSlideshowUrl,
    setBannerUrl,
    setIsGeneratingSlideshow,
    setIsGeneratingBanner,
    setSlideshowRenderId,
    
    // From media selection hook
    selectedImages,
    setSelectedImages,
    bannerType,
    setBannerType,
    bannerImage,
    toggleImageSelection,
    onDragEnd,
    selectBannerImage,
    
    // From broker info hook
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
    
    // From network selection hook
    selectedNetworks,
    setSelectedNetworks,
    handleNetworkChange,
    
    // Handlers
    handlePublicationTypeChange,
    handleGenerateText,
    handleGenerateSlideshow,
    handleGenerateBanner
  };
};

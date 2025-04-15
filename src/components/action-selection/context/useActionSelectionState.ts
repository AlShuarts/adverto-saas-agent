
import { useState, useEffect } from 'react';
import { PublicationType, SocialNetworks, ActionSelectionState } from './types';
import { Tables } from "@/integrations/supabase/types";
import { useTemplates } from '../hooks/useTemplates';
import { useTextGeneration } from '../hooks/useTextGeneration';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMediaGeneration } from '../hooks/useMediaGeneration';

export const useActionSelectionState = (listing: Tables<"listings">) => {
  // Initialize state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [bannerType, setBannerType] = useState<"VENDU" | "A_VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<SocialNetworks>({
    facebook: false,
    instagram: false
  });
  
  const [brokerImageUrl, setBrokerImageUrl] = useState<string | null>(null);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);
  const [brokerName, setBrokerName] = useState<string>("");
  const [brokerEmail, setBrokerEmail] = useState<string>("");
  const [brokerPhone, setBrokerPhone] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

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
    setSelectedImages([]);
    setBannerImage(listing.images?.[0] || null);
    setSelectedNetworks({ facebook: false, instagram: false });
    setGeneratedText("");
    setSlideshowUrl(null);
    setBannerUrl(null);
    setBrokerImageUrl(null);
    setAgencyLogoUrl(null);
    setBrokerName("");
    setBrokerEmail("");
    setBrokerPhone("");
    setFormErrors({});
  };

  // Media selection handlers
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };
  
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedImages(items);
  };
  
  const selectBannerImage = (imageUrl: string) => {
    setBannerImage(imageUrl);
  };
  
  // Publication type handler
  const handlePublicationTypeChange = (type: PublicationType, checked: boolean) => {
    setSelectedPublicationTypes(prev => 
      checked 
        ? [...prev, type] 
        : prev.filter(t => t !== type)
    );
  };
  
  // Network handler
  const handleNetworkChange = (network: keyof SocialNetworks, checked: boolean) => {
    setSelectedNetworks({
      ...selectedNetworks,
      [network]: checked
    });
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
    selectedImages,
    setSelectedImages,
    bannerType,
    setBannerType,
    bannerImage,
    selectedNetworks,
    setSelectedNetworks,
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
    
    // Handlers
    toggleImageSelection,
    onDragEnd,
    selectBannerImage,
    handlePublicationTypeChange,
    handleNetworkChange,
    handleGenerateText,
    handleGenerateSlideshow,
    handleGenerateBanner
  };
};

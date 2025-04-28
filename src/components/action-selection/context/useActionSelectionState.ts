
import { useState } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { PublicationType } from './types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useBrokerInfo } from '../hooks/useBrokerInfo';
import { useSocialNetworkSelection } from '../hooks/useSocialNetworkSelection';
import { useInitialization } from '../hooks/useInitialization';
import { usePublicationTypeHandler } from '../hooks/usePublicationTypeHandler';
import { useMediaState } from '../hooks/useMediaState';
import { useTemplateState } from '../hooks/useTemplateState';
import { validateBrokerInfo } from '../hooks/generation/utils/bannerValidation';

export const useActionSelectionState = (listing: Tables<"listings">) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Use our new focused hooks
  const templateState = useTemplateState(listing);
  const mediaState = useMediaState(listing.id);
  
  // Use existing hooks
  const {
    currentlyPlaying,
    musicList,
    selectedMusic,
    fetchMusic,
    handleMusicChange,
    previewMusic,
    stopAudio
  } = useAudioPlayer();
  
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
    validateBrokerInfo: validateBrokerInfoFromHook
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
  
  // Synchronize the selected music from the audio player to media state
  // This is crucial for passing the selected music to the slideshow generation
  if (selectedMusic !== mediaState.selectedMusic) {
    mediaState.setSelectedMusic(selectedMusic);
  }
  
  // Initialize and reset
  const resetState = () => {
    setCurrentStep(1);
    setSelectedPublicationTypes([]);
    templateState.resetTemplates();
    mediaState.resetMediaSelection(listing.images?.[0] || null);
    resetNetworks();
    resetBrokerInfo();
    templateState.setGeneratedText("");
    mediaState.setSlideshowUrl(null);
    mediaState.setBannerUrl(null);
  };

  useInitialization(listing, resetState, templateState.fetchTemplates, fetchMusic);

  return {
    currentStep,
    setCurrentStep,
    selectedPublicationTypes,
    
    // From template state
    ...templateState,
    
    // From audio player
    currentlyPlaying,
    musicList,
    selectedMusic,
    handleMusicChange,
    previewMusic,
    stopAudio,
    
    // From media state
    ...mediaState,
    
    // From broker info
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
    
    // From social network selection
    selectedNetworks,
    setSelectedNetworks,
    handleNetworkChange,
    
    // Action handlers
    handlePublicationTypeChange,
    handleGenerateText: () => templateState.generateText(templateState.selectedFacebookTemplateId, templateState.facebookTemplates),
    handleGenerateSlideshow: () => mediaState.handleGenerateSlideshow(),
    handleGenerateBanner: (bannerImage: string | null, bannerType: "VENDU" | "A_VENDRE", brokerInfo: any) => 
      mediaState.handleGenerateBanner(bannerImage, bannerType, brokerInfo, validateBrokerInfo, setFormErrors),
    onDragEnd: mediaState.onDragEnd
  };
};

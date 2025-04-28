
import { createContext, useContext } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

// Import types and hooks
import { 
  ActionSelectionContextType, 
  ActionSelectionProviderProps 
} from "./types";
import { useActionSelectionState } from "./useActionSelectionState";
import { useNavigationUtils } from "./useNavigationUtils";
import { useSlideshowMonitor } from "./useSlideshowMonitor";
import { useSocialPublishing } from "../hooks/useSocialPublishing";

export const ActionSelectionContext = createContext<ActionSelectionContextType | undefined>(undefined);

export const ActionSelectionProvider = ({ 
  children, 
  listing,
  onClose 
}: ActionSelectionProviderProps) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  
  // Import state management
  const state = useActionSelectionState(listing);
  
  // Import social publishing
  const { isPublishing, publish } = useSocialPublishing(listing, profile);
  
  // Import navigation utilities
  const navigation = useNavigationUtils(
    state.currentStep,
    state.setCurrentStep,
    state.selectedPublicationTypes,
    state.selectedImages,
    state.bannerImage,
    state.selectedNetworks,
    state.generatedText,
    state.slideshowUrl,
    state.bannerUrl
  );
  
  // Import slideshow monitor
  const slideshowMonitor = useSlideshowMonitor(
    listing.id,
    state.selectedPublicationTypes,
    state.slideshowRenderId,
    state.setSlideshowUrl,
    state.setIsGeneratingSlideshow
  );
  
  // Publishing handler
  const handlePublish = async (): Promise<{ success?: boolean; error?: string }> => {
    const result = await publish(
      state.selectedNetworks,
      state.selectedPublicationTypes,
      state.generatedText,
      state.selectedImages,
      state.bannerUrl,
      state.slideshowUrl,
      state.selectedFacebookTemplateId,
      state.selectedInstagramTemplateId
    );
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      onClose();
    }
    
    return result;
  };

  return (
    <ActionSelectionContext.Provider value={{
      // Steps control
      currentStep: state.currentStep,
      setCurrentStep: state.setCurrentStep,
      nextStep: navigation.nextStep,
      prevStep: navigation.prevStep,
      canGoToNextStep: navigation.canGoToNextStep,
      
      // Publication types
      selectedPublicationTypes: state.selectedPublicationTypes,
      handlePublicationTypeChange: state.handlePublicationTypeChange,
      
      // Templates
      facebookTemplates: state.facebookTemplates,
      instagramTemplates: state.instagramTemplates,
      selectedFacebookTemplateId: state.selectedFacebookTemplateId,
      selectedInstagramTemplateId: state.selectedInstagramTemplateId,
      setSelectedFacebookTemplateId: state.setSelectedFacebookTemplateId,
      setSelectedInstagramTemplateId: state.setSelectedInstagramTemplateId,
      
      // Text generation
      isGeneratingText: state.isGeneratingText,
      generatedText: state.generatedText,
      setGeneratedText: state.setGeneratedText,
      handleGenerateText: state.handleGenerateText,
      
      // Media selection
      selectedImages: state.selectedImages,
      setSelectedImages: state.setSelectedImages,
      toggleImageSelection: state.toggleImageSelection,
      onDragEnd: state.onDragEnd,
      
      // Banner
      bannerType: state.bannerType,
      setBannerType: state.setBannerType,
      bannerImage: state.bannerImage,
      selectBannerImage: state.selectBannerImage,
      
      // Audio
      currentlyPlaying: state.currentlyPlaying,
      musicList: state.musicList,
      selectedMusic: state.selectedMusic,
      handleMusicChange: state.handleMusicChange,
      previewMusic: state.previewMusic,
      stopAudio: state.stopAudio,
      
      // Broker info
      brokerImageUrl: state.brokerImageUrl,
      setBrokerImageUrl: state.setBrokerImageUrl,
      agencyLogoUrl: state.agencyLogoUrl,
      setAgencyLogoUrl: state.setAgencyLogoUrl,
      brokerName: state.brokerName,
      setBrokerName: state.setBrokerName,
      brokerEmail: state.brokerEmail,
      setBrokerEmail: state.setBrokerEmail,
      brokerPhone: state.brokerPhone,
      setBrokerPhone: state.setBrokerPhone,
      formErrors: state.formErrors,
      setFormErrors: state.setFormErrors,
      
      // Media generation
      isGeneratingSlideshow: state.isGeneratingSlideshow,
      isGeneratingBanner: state.isGeneratingBanner,
      slideshowUrl: state.slideshowUrl,
      bannerUrl: state.bannerUrl,
      slideshowError: state.slideshowError,
      bannerError: state.bannerError,
      slideshowRenderId: state.slideshowRenderId,
      bannerRenderId: state.bannerRenderId,
      handleGenerateSlideshow: state.handleGenerateSlideshow,
      handleGenerateBanner: async () => {
        // Create a wrapper function that accesses the state values directly
        const brokerInfo = {
          brokerImageUrl: state.brokerImageUrl,
          agencyLogoUrl: state.agencyLogoUrl,
          brokerName: state.brokerName,
          brokerEmail: state.brokerEmail,
          brokerPhone: state.brokerPhone
        };
        return await state.handleGenerateBanner(state.bannerImage, state.bannerType, brokerInfo);
      },
      refetchSlideshowStatus: slideshowMonitor.refetchSlideshowStatus,
      
      // Social networks
      selectedNetworks: state.selectedNetworks,
      setSelectedNetworks: state.setSelectedNetworks,
      handleNetworkChange: state.handleNetworkChange,
      
      // Publishing
      isPublishing,
      handlePublish,
      
      // Dialog control
      onClose,
      
      // Listing data
      listing
    }}>
      {children}
    </ActionSelectionContext.Provider>
  );
};

export const useActionSelection = () => {
  const context = useContext(ActionSelectionContext);
  
  if (context === undefined) {
    throw new Error('useActionSelection must be used within an ActionSelectionProvider');
  }
  
  return context;
};

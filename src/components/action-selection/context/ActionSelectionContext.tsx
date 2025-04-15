
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { PublicationType, SocialNetworks } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

// Import hooks
import { useTemplates } from "../hooks/useTemplates";
import { useTextGeneration } from "../hooks/useTextGeneration";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useMediaGeneration } from "../hooks/useMediaGeneration";
import { useSocialPublishing } from "../hooks/useSocialPublishing";

type ActionSelectionContextType = {
  // Steps control
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoToNextStep: () => boolean;
  
  // Publication types
  selectedPublicationTypes: PublicationType[];
  handlePublicationTypeChange: (type: PublicationType, checked: boolean) => void;
  
  // Templates
  facebookTemplates: { id: string; name: string; content?: string }[];
  instagramTemplates: { id: string; name: string }[];
  selectedFacebookTemplateId: string;
  selectedInstagramTemplateId: string;
  setSelectedFacebookTemplateId: (id: string) => void;
  setSelectedInstagramTemplateId: (id: string) => void;
  
  // Text generation
  isGeneratingText: boolean;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  handleGenerateText: () => Promise<void>;
  
  // Media selection
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  toggleImageSelection: (imageUrl: string) => void;
  onDragEnd: (result: any) => void;
  
  // Banner
  bannerType: "VENDU" | "À VENDRE";
  setBannerType: (type: "VENDU" | "À VENDRE") => void;
  bannerImage: string | null;
  selectBannerImage: (imageUrl: string) => void;
  
  // Audio
  audioPlaying: boolean;
  currentlyPlaying: string | null;
  musicList: string[];
  selectedMusic: string | undefined;
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
  stopAudio: () => void;
  
  // Broker info
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  
  // Media generation
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  handleGenerateSlideshow: () => Promise<string | null>;
  handleGenerateBanner: () => Promise<void>;
  refetchSlideshowStatus: () => void;
  
  // Social networks
  selectedNetworks: SocialNetworks;
  setSelectedNetworks: (networks: SocialNetworks) => void;
  handleNetworkChange: (network: keyof SocialNetworks, checked: boolean) => void;
  
  // Publishing
  isPublishing: boolean;
  handlePublish: () => Promise<void>;
  
  // Dialog control
  onClose: () => void;
  
  // Listing data
  listing: Tables<"listings">;
};

export const ActionSelectionContext = createContext<ActionSelectionContextType | undefined>(undefined);

export const ActionSelectionProvider = ({ 
  children, 
  listing,
  onClose 
}: { 
  children: ReactNode;
  listing: Tables<"listings">;
  onClose: () => void;
}) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [bannerType, setBannerType] = useState<"VENDU" | "À VENDRE">("VENDU");
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
  
  const {
    isPublishing,
    publish
  } = useSocialPublishing(listing, profile);
  
  const { 
    data: slideshowRender, 
    isLoading: isSlideshowStatusLoading,
    error: slideshowStatusError,
    refetch: refetchSlideshowStatus
  } = useSlideshowStatus(listing.id);

  useEffect(() => {
    if (slideshowRender && selectedPublicationTypes.includes("slideshow")) {
      if ((slideshowRender.status === "completed" || slideshowRender.status === "done") && slideshowRender.video_url) {
        setSlideshowUrl(slideshowRender.video_url);
        setIsGeneratingSlideshow(false);
        toast.success("Diaporama généré avec succès");
      } 
      
      else if (slideshowRender.status === "error" || slideshowRender.status === "failed") {
        setIsGeneratingSlideshow(false);
        toast.error("Échec de la génération du diaporama");
      }
      
      else if (slideshowRender.status === "pending" || slideshowRender.status === "processing" || slideshowRender.status === "rendering") {
        if (slideshowRenderId) {
          const checkTimer = setTimeout(() => {
            console.log("Vérification périodique du statut du diaporama...");
            refetchSlideshowStatus();
          }, 5000);
          
          return () => clearTimeout(checkTimer);
        }
      }
    }
  }, [slideshowRender, refetchSlideshowStatus, slideshowRenderId, selectedPublicationTypes]);

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

  const handlePublicationTypeChange = (type: PublicationType, checked: boolean) => {
    setSelectedPublicationTypes(prev => 
      checked 
        ? [...prev, type] 
        : prev.filter(t => t !== type)
    );
  };
  
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

  const handleGenerateText = async () => {
    await generateText(selectedFacebookTemplateId, facebookTemplates);
  };
  
  const handleGenerateSlideshow = async () => {
    return await generateSlideshow(selectedImages, selectedMusic);
  };
  
  const handleGenerateBanner = async () => {
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
  
  const handleNetworkChange = (network: keyof SocialNetworks, checked: boolean) => {
    setSelectedNetworks({
      ...selectedNetworks,
      [network]: checked
    });
  };
  
  const handlePublish = async () => {
    const result = await publish(
      selectedNetworks,
      selectedPublicationTypes,
      generatedText,
      selectedImages,
      bannerUrl,
      slideshowUrl,
      selectedFacebookTemplateId,
      selectedInstagramTemplateId
    );
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      onClose();
    }
  };
  
  const canGoToNextStep = () => {
    switch (currentStep) {
      case 1: 
        return selectedPublicationTypes.length > 0;
      case 2: 
        return true; 
      case 3: 
        return !(
          (selectedPublicationTypes.includes("photo") && selectedImages.length === 0) ||
          (selectedPublicationTypes.includes("banner") && !bannerImage)
        );
      case 3.5: 
        const needsSlideshow = selectedPublicationTypes.includes("slideshow");
        const needsBanner = selectedPublicationTypes.includes("banner");
        
        const slideshowReady = !needsSlideshow || slideshowUrl;
        const bannerReady = !needsBanner || bannerUrl;
        
        return slideshowReady && bannerReady;
      case 4: 
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (currentStep === 3) {
      const needsGeneration = selectedPublicationTypes.includes("slideshow") || selectedPublicationTypes.includes("banner");
      
      if (needsGeneration) {
        setCurrentStep(3.5);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 3.5) {
      setCurrentStep(4);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 3.5) {
      setCurrentStep(3);
    } else if (currentStep === 4 && 
              (selectedPublicationTypes.includes("slideshow") || 
               selectedPublicationTypes.includes("banner"))) {
      setCurrentStep(3.5);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ActionSelectionContext.Provider value={{
      // Steps control
      currentStep,
      setCurrentStep,
      nextStep,
      prevStep,
      canGoToNextStep,
      
      // Publication types
      selectedPublicationTypes,
      handlePublicationTypeChange,
      
      // Templates
      facebookTemplates,
      instagramTemplates,
      selectedFacebookTemplateId,
      selectedInstagramTemplateId,
      setSelectedFacebookTemplateId,
      setSelectedInstagramTemplateId,
      
      // Text generation
      isGeneratingText,
      generatedText,
      setGeneratedText,
      handleGenerateText,
      
      // Media selection
      selectedImages,
      setSelectedImages,
      toggleImageSelection,
      onDragEnd,
      
      // Banner
      bannerType,
      setBannerType,
      bannerImage,
      selectBannerImage,
      
      // Audio
      audioPlaying,
      currentlyPlaying,
      musicList,
      selectedMusic,
      handleMusicChange,
      previewMusic,
      stopAudio,
      
      // Broker info
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
      
      // Media generation
      isGeneratingSlideshow,
      isGeneratingBanner,
      slideshowUrl,
      bannerUrl,
      slideshowError,
      bannerError,
      slideshowRenderId,
      handleGenerateSlideshow,
      handleGenerateBanner,
      refetchSlideshowStatus,
      
      // Social networks
      selectedNetworks,
      setSelectedNetworks,
      handleNetworkChange,
      
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

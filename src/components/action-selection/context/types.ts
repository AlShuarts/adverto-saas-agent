
import { Tables } from "@/integrations/supabase/types";

// Publication types
export type PublicationType = "photo" | "slideshow" | "banner";

// Social networks
export interface SocialNetworks {
  facebook: boolean;
  instagram: boolean;
}

// Broker information
export interface BrokerInfo {
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
}

// Context state interface
export interface ActionSelectionState {
  // Steps control
  currentStep: number;
  
  // Publication types
  selectedPublicationTypes: PublicationType[];
  
  // Templates
  selectedFacebookTemplateId: string;
  selectedInstagramTemplateId: string;
  
  // Text generation
  generatedText: string;
  
  // Media selection
  selectedImages: string[];
  
  // Banner
  bannerType: "VENDU" | "A_VENDRE";
  bannerImage: string | null;
  
  // Audio
  selectedMusic: string | undefined;
  
  // Broker info
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  formErrors: {[key: string]: string};
  
  // Media generation
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowRenderId: string | null;
  bannerRenderId: string | null;
  
  // Social networks
  selectedNetworks: SocialNetworks;
}

// Action Selection Context Interface
export interface ActionSelectionContextType extends ActionSelectionState {
  // Steps control
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoToNextStep: () => boolean;
  
  // Publication types
  handlePublicationTypeChange: (type: PublicationType, checked: boolean) => void;
  
  // Templates
  facebookTemplates: { id: string; name: string; content?: string }[];
  instagramTemplates: { id: string; name: string }[];
  setSelectedFacebookTemplateId: (id: string) => void;
  setSelectedInstagramTemplateId: (id: string) => void;
  
  // Text generation
  isGeneratingText: boolean;
  setGeneratedText: (text: string) => void;
  handleGenerateText: () => Promise<void>;
  
  // Media selection
  setSelectedImages: (images: string[]) => void;
  toggleImageSelection: (imageUrl: string) => void;
  selectAllImages: (images: string[]) => void;
  deselectAllImages: () => void;
  onDragEnd: (result: any) => void;
  
  // Banner
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
  
  // Audio
  currentlyPlaying: string | null;
  musicList: string[];
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
  stopAudio: () => void;
  
  // Broker info
  setBrokerImageUrl: (url: string | null) => void;
  setAgencyLogoUrl: (url: string | null) => void;
  setBrokerName: (name: string) => void;
  setBrokerEmail: (email: string) => void;
  setBrokerPhone: (phone: string) => void;
  setFormErrors: (errors: {[key: string]: string}) => void;
  
  // Media generation
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowError: string | null;
  bannerError: string | null;
  bannerRenderId: string | null;
  handleGenerateSlideshow: () => Promise<string | null>;
  handleGenerateBanner: () => Promise<{ success?: boolean; errors?: Record<string, string>; }>;
  refetchSlideshowStatus: () => void;
  
  // Social networks
  setSelectedNetworks: (networks: SocialNetworks) => void;
  handleNetworkChange: (network: keyof SocialNetworks, checked: boolean) => void;
  
  // Publishing
  isPublishing: boolean;
  handlePublish: () => Promise<{ success?: boolean; error?: string }>;
  
  // Dialog control
  onClose: () => void;
  
  // Listing data
  listing: Tables<"listings">;
}

// Provider props
export interface ActionSelectionProviderProps {
  children: React.ReactNode;
  listing: Tables<"listings">;
  onClose: () => void;
}


import { MediaGenerationStep } from "../media-generation/MediaGenerationStep";
import { PublicationType, PhotoType } from "../types";
import { Tables } from "@/integrations/supabase/types";

type GenerationStepProps = {
  selectedPublicationType: PublicationType | null;
  selectedPhotoType?: PhotoType | null;
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
  selectedMusic?: string;
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowRenderId: string | null;
  bannerRenderId: string | null;
  slideshowError: string | null;
  bannerError: string | null;
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
  onRegenerateSlideshow: () => void;
  onRegenerateBanner: () => void;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  refetchSlideshowStatus: () => void;
  toggleImageSelection: (imageUrl: string) => void;
  listing: Tables<"listings">;
  handleMusicChange: (music: string) => void;
  previewMusic: (musicName: string) => void;
  currentlyPlaying: string | null;
  musicList: string[];
  onDragEnd: (result: any) => void;
};

export const GenerationStep = (props: GenerationStepProps) => {
  return (
    <MediaGenerationStep
      {...props}
    />
  );
};

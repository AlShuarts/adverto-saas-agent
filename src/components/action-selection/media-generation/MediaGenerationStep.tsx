
import { SlideshowGenerationSection } from "./SlideshowGenerationSection";
import { BannerGenerationSection } from "./BannerGenerationSection";
import { PublicationType, PhotoType } from "../types";
import { Tables } from "@/integrations/supabase/types";

type MediaGenerationStepProps = {
  selectedPublicationType: PublicationType | null;
  selectedPhotoType?: PhotoType | null;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  bannerRenderId: string | null;
  formErrors: {[key: string]: string};
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  refetchSlideshowStatus: () => void;
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
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
  setFormErrors: (errors: {[key: string]: string}) => void;
  listing: Tables<"listings">;
  onRegenerateBanner: () => void;
  onRegenerateSlideshow: () => void;
  selectedImages: string[];
  toggleImageSelection: (imageUrl: string) => void;
  selectedMusic?: string;
  handleMusicChange: (music: string) => void;
  previewMusic: (musicName: string) => void;
  currentlyPlaying: string | null;
  musicList: string[];
  onDragEnd: (result: any) => void;
};

export const MediaGenerationStep = ({
  selectedPublicationType,
  selectedPhotoType,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowUrl,
  bannerUrl,
  slideshowError,
  bannerError,
  slideshowRenderId,
  bannerRenderId,
  formErrors,
  generateSlideshow,
  generateBanner,
  refetchSlideshowStatus,
  bannerImage,
  bannerType,
  setBannerType,
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
  setFormErrors,
  listing,
  onRegenerateBanner,
  onRegenerateSlideshow,
  selectedImages,
  toggleImageSelection,
  selectedMusic
}: MediaGenerationStepProps) => {
  if (selectedPublicationType === "slideshow") {
    return (
      <SlideshowGenerationSection
        isGeneratingSlideshow={isGeneratingSlideshow}
        slideshowUrl={slideshowUrl}
        slideshowError={slideshowError}
        slideshowRenderId={slideshowRenderId}
        generateSlideshow={generateSlideshow}
        refetchSlideshowStatus={refetchSlideshowStatus}
        onRegenerateSlideshow={onRegenerateSlideshow}
        selectedImages={selectedImages}
        toggleImageSelection={toggleImageSelection}
        selectedMusic={selectedMusic}
      />
    );
  }

  if (selectedPhotoType === "banner") {
    return (
      <BannerGenerationSection
        isGeneratingBanner={isGeneratingBanner}
        bannerUrl={bannerUrl}
        bannerError={bannerError}
        bannerRenderId={bannerRenderId}
        generateBanner={generateBanner}
        bannerImage={bannerImage}
        bannerType={bannerType}
        setBannerType={setBannerType}
        selectBannerImage={selectBannerImage}
        brokerName={brokerName}
        setBrokerName={setBrokerName}
        brokerEmail={brokerEmail}
        setBrokerEmail={setBrokerEmail}
        brokerPhone={brokerPhone}
        setBrokerPhone={setBrokerPhone}
        brokerImageUrl={brokerImageUrl}
        setBrokerImageUrl={setBrokerImageUrl}
        agencyLogoUrl={agencyLogoUrl}
        setAgencyLogoUrl={setAgencyLogoUrl}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        selectedImages={selectedImages}
        onRegenerateBanner={onRegenerateBanner}
        listing={listing}
      />
    );
  }

  return null;
};

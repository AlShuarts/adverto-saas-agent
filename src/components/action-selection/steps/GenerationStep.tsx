
import { MediaGenerationStep } from "../media-generation/MediaGenerationStep";
import { PublicationType } from "../types";
import { Tables } from "@/integrations/supabase/types";

type GenerationStepProps = {
  selectedPublicationTypes: PublicationType[];
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

export const GenerationStep = ({
  selectedPublicationTypes,
  selectedImages,
  bannerImage,
  bannerType,
  setBannerType,
  selectBannerImage,
  selectedMusic,
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
  generateSlideshow,
  generateBanner,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowRenderId,
  bannerRenderId,
  slideshowError,
  bannerError,
  slideshowUrl,
  bannerUrl,
  refetchSlideshowStatus,
  onRegenerateSlideshow,
  onRegenerateBanner,
  toggleImageSelection,
  listing,
  handleMusicChange,
  previewMusic,
  currentlyPlaying,
  musicList,
  onDragEnd
}: GenerationStepProps) => {
  return (
    <MediaGenerationStep
      selectedPublicationTypes={selectedPublicationTypes}
      isGeneratingSlideshow={isGeneratingSlideshow}
      isGeneratingBanner={isGeneratingBanner}
      slideshowUrl={slideshowUrl}
      bannerUrl={bannerUrl}
      slideshowError={slideshowError}
      bannerError={bannerError}
      slideshowRenderId={slideshowRenderId}
      bannerRenderId={bannerRenderId}
      formErrors={formErrors}
      generateSlideshow={generateSlideshow}
      generateBanner={generateBanner}
      refetchSlideshowStatus={refetchSlideshowStatus}
      bannerImage={bannerImage}
      bannerType={bannerType}
      setBannerType={setBannerType}
      selectBannerImage={selectBannerImage}
      brokerImageUrl={brokerImageUrl}
      setBrokerImageUrl={setBrokerImageUrl}
      agencyLogoUrl={agencyLogoUrl}
      setAgencyLogoUrl={setAgencyLogoUrl}
      brokerName={brokerName}
      setBrokerName={setBrokerName}
      brokerEmail={brokerEmail}
      setBrokerEmail={setBrokerEmail}
      brokerPhone={brokerPhone}
      setBrokerPhone={setBrokerPhone}
      setFormErrors={setFormErrors}
      listing={listing}
      onRegenerateBanner={onRegenerateBanner}
      onRegenerateSlideshow={onRegenerateSlideshow}
      selectedImages={selectedImages}
      toggleImageSelection={toggleImageSelection}
      selectedMusic={selectedMusic}
      handleMusicChange={handleMusicChange}
      previewMusic={previewMusic}
      currentlyPlaying={currentlyPlaying}
      musicList={musicList}
      onDragEnd={onDragEnd}
    />
  );
};

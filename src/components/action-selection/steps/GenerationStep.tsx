
import { MediaGenerationStep } from "../MediaGenerationStep";
import { PublicationType } from "../types";
import { SocialNetworks } from "../context/types";

type GenerationStepProps = {
  selectedPublicationTypes: PublicationType[];
  selectedNetworks: SocialNetworks;
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  selectedMusic: string | undefined;
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowRenderId: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  setFormErrors: (errors: {[key: string]: string}) => void;
  onRegenerateSlideshow: () => void;
  onRegenerateBanner: () => void;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  refetchSlideshowStatus: () => void;
  formErrors: {[key: string]: string};
};

export const GenerationStep = ({
  selectedPublicationTypes,
  selectedNetworks,
  selectedImages,
  bannerImage,
  bannerType,
  selectedMusic,
  generateSlideshow,
  generateBanner,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowRenderId,
  slideshowError,
  bannerError,
  slideshowUrl,
  bannerUrl,
  refetchSlideshowStatus,
  formErrors,
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
      formErrors={formErrors}
      generateSlideshow={generateSlideshow}
      generateBanner={generateBanner}
      selectedImages={selectedImages}
      refetchSlideshowStatus={refetchSlideshowStatus}
    />
  );
};

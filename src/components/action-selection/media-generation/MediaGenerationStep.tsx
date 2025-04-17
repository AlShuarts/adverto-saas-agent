
import { SlideshowGenerationSection } from "./SlideshowGenerationSection";
import { BannerGenerationSection } from "./BannerGenerationSection";
import { PublicationType } from "../types";

type MediaGenerationStepProps = {
  selectedPublicationTypes: Array<"photo" | "slideshow" | "banner">;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  formErrors: {[key: string]: string};
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  selectedImages: string[];
  selectedMusic: string | undefined;
  refetchSlideshowStatus: () => void;
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  setFormErrors: (errors: {[key: string]: string}) => void;
};

export const MediaGenerationStep = ({
  selectedPublicationTypes,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowUrl,
  bannerUrl,
  slideshowError,
  bannerError,
  slideshowRenderId,
  formErrors,
  generateSlideshow,
  generateBanner,
  selectedImages,
  selectedMusic,
  refetchSlideshowStatus,
  bannerImage,
  bannerType,
  setBannerType,
  selectBannerImage,
  brokerName,
  setBrokerName,
  brokerEmail,
  setBrokerEmail,
  brokerPhone,
  setBrokerPhone,
  brokerImageUrl,
  setBrokerImageUrl,
  agencyLogoUrl,
  setAgencyLogoUrl,
  setFormErrors
}: MediaGenerationStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 3.5: Génération des médias</h3>
      
      {selectedPublicationTypes.includes("slideshow") && (
        <SlideshowGenerationSection
          isGeneratingSlideshow={isGeneratingSlideshow}
          slideshowUrl={slideshowUrl}
          slideshowError={slideshowError}
          slideshowRenderId={slideshowRenderId}
          generateSlideshow={generateSlideshow}
          refetchSlideshowStatus={refetchSlideshowStatus}
          selectedImages={selectedImages}
          selectedMusic={selectedMusic}
        />
      )}
      
      {selectedPublicationTypes.includes("banner") && (
        <BannerGenerationSection
          isGeneratingBanner={isGeneratingBanner}
          bannerUrl={bannerUrl}
          bannerError={bannerError}
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
        />
      )}
    </div>
  );
};

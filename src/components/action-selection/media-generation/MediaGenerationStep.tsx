
import { ScrollArea } from "@/components/ui/scroll-area";
import { SlideshowGenerationSection } from "./SlideshowGenerationSection";
import { BannerGenerationSection } from "./BannerGenerationSection";
import { PublicationType } from "../types";
import { Tables } from "@/integrations/supabase/types";

type MediaGenerationStepProps = {
  selectedPublicationTypes: PublicationType[];
  selectedImages: string[];
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
  onRegenerateSlideshow: () => void;
  onRegenerateBanner: () => void;
  selectedMusic: string | undefined;
  toggleImageSelection: (imageUrl: string) => void;
  listing: Tables<"listings">;
};

export const MediaGenerationStep = ({
  selectedPublicationTypes,
  selectedImages,
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
  onRegenerateSlideshow,
  onRegenerateBanner,
  selectedMusic,
  toggleImageSelection,
  listing
}: MediaGenerationStepProps) => {
  
  const showSlideshow = selectedPublicationTypes.includes("slideshow");
  const showBanner = selectedPublicationTypes.includes("banner");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Génération du contenu</h3>
      
      <ScrollArea className="h-[650px] pr-4">
        <div className="space-y-6">
          {showSlideshow && (
            <SlideshowGenerationSection
              isGeneratingSlideshow={isGeneratingSlideshow}
              slideshowUrl={slideshowUrl}
              slideshowError={slideshowError}
              slideshowRenderId={slideshowRenderId}
              generateSlideshow={generateSlideshow}
              refetchSlideshowStatus={refetchSlideshowStatus}
              onRegenerateSlideshow={onRegenerateSlideshow}
              selectedImages={selectedImages}
              selectedMusic={selectedMusic}
              toggleImageSelection={toggleImageSelection}
            />
          )}
          
          {showBanner && (
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
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};


import { PublicationType } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BannerGenerationSection } from "./BannerGenerationSection";
import { PhotoSelectionSection } from "../media-selector/PhotoSelectionSection";
import { SlideshowGenerationSection } from "./SlideshowGenerationSection";

type MediaGenerationStepProps = {
  selectedPublicationTypes?: PublicationType[];
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  generateBanner: () => Promise<void>;
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
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  listing: {
    images: string[];
  };
  isGeneratingSlideshow?: boolean;
  slideshowUrl?: string | null;
  slideshowError?: string | null;
  slideshowRenderId?: string | null;
  generateSlideshow?: () => Promise<string | null>;
  refetchSlideshowStatus?: () => void;
  onRegenerateBanner?: () => void;
  selectedImages?: string[];
  toggleImageSelection?: (imageUrl: string) => void;
  selectedMusic?: string;
  onRegenerateSlideshow?: () => void;
};

export const MediaGenerationStep = ({
  selectedPublicationTypes,
  bannerType,
  setBannerType,
  bannerImage,
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
  formErrors,
  setFormErrors,
  listing,
  isGeneratingBanner,
  bannerUrl,
  bannerError,
  generateBanner,
  isGeneratingSlideshow,
  slideshowUrl,
  slideshowError,
  slideshowRenderId,
  generateSlideshow,
  refetchSlideshowStatus,
  onRegenerateBanner,
  onRegenerateSlideshow,
  selectedImages,
  toggleImageSelection,
  selectedMusic
}: MediaGenerationStepProps) => {
  const showBannerSection = selectedPublicationTypes?.includes("banner");
  const showSlideshowSection = selectedPublicationTypes?.includes("slideshow");

  return (
    <div className="space-y-6 bg-gray-950 p-6 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-white">Génération des médias</h3>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {/* Image Selection - Always shown */}
          {toggleImageSelection && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-white mb-3">Sélection des images</h4>
              <PhotoSelectionSection
                images={listing.images || []}
                selectedImages={selectedImages || []}
                toggleImageSelection={toggleImageSelection}
              />
            </div>
          )}

          {/* Slideshow Generation Section */}
          {showSlideshowSection && generateSlideshow && (
            <SlideshowGenerationSection
              isGeneratingSlideshow={isGeneratingSlideshow || false}
              slideshowUrl={slideshowUrl || null}
              slideshowError={slideshowError || null}
              slideshowRenderId={slideshowRenderId || null}
              generateSlideshow={generateSlideshow}
              refetchSlideshowStatus={refetchSlideshowStatus || (() => {})}
              selectedImages={selectedImages || []}
              selectedMusic={selectedMusic}
              onRegenerateSlideshow={onRegenerateSlideshow || (() => {})}
            />
          )}

          {/* Banner Generation Section */}
          {showBannerSection && (
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
              selectedImages={selectedImages || []}
              onRegenerateBanner={onRegenerateBanner}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

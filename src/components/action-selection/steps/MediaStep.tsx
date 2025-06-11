import { SlideshowGenerationSection } from "../media-generation/SlideshowGenerationSection";
import { BannerGenerationSection } from "../media-generation/BannerGenerationSection";
import { PublicationType, PhotoType } from "../types";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowConfig } from "../media-selector/SlideshowConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageSelection } from "../media-generation/components/ImageSelection";

type MediaStepProps = {
  selectedPublicationType: PublicationType | null;
  selectedPhotoType?: PhotoType | null;
  images: string[];
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  musicList: string[];
  selectedMusic: string | undefined;
  currentlyPlaying: string | null;
  toggleImageSelection: (imageUrl: string) => void;
  selectAllImages: (images: string[]) => void;
  deselectAllImages: () => void;
  onDragEnd: (result: any) => void;
  selectBannerImage: (imageUrl: string) => void;
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
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
  formErrors: {
    [key: string]: string;
  };
  setFormErrors: (errors: {
    [key: string]: string;
  }) => void;
  listing: Tables<"listings">;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  bannerRenderId: string | null;
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  refetchSlideshowStatus: () => void;
  handleRegenerateSlideshow: () => void;
  handleRegenerateBanner: () => void;
};

export const MediaStep = ({
  selectedPublicationType,
  selectedPhotoType,
  images,
  selectedImages,
  bannerImage,
  bannerType,
  musicList,
  selectedMusic,
  currentlyPlaying,
  toggleImageSelection,
  selectAllImages,
  deselectAllImages,
  onDragEnd,
  selectBannerImage,
  handleMusicChange,
  previewMusic,
  setBannerType,
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
  listing,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowUrl,
  bannerUrl,
  slideshowError,
  bannerError,
  slideshowRenderId,
  bannerRenderId,
  generateSlideshow,
  generateBanner,
  refetchSlideshowStatus,
  handleRegenerateSlideshow,
  handleRegenerateBanner
}: MediaStepProps) => {
  const isMobile = useIsMobile();
  const availableImages = listing?.images || images;
  const showSlideshow = selectedPublicationType === "slideshow";
  const showBanner = selectedPhotoType === "banner";
  const showListingPhotos = selectedPhotoType === "listing_photos";

  return (
    <div className="space-y-4">
      <ScrollArea className={isMobile ? "h-[50vh]" : "h-[55vh]"}>
        <div className="space-y-4 pr-2 pb-6">
          {/* For listing photos only */}
          {showListingPhotos && (
            <div className="space-y-4">
              <ImageSelection 
                selectedImages={selectedImages} 
                toggleImageSelection={toggleImageSelection} 
                availableImages={availableImages} 
                onSelectAll={() => selectAllImages(availableImages)} 
                onDeselectAll={deselectAllImages} 
              />
            </div>
          )}
          
          {/* For slideshow publication type */}
          {showSlideshow && (
            <div className="space-y-4">
              <SlideshowConfig 
                images={availableImages} 
                selectedImages={selectedImages} 
                musicList={musicList} 
                selectedMusic={selectedMusic} 
                currentlyPlaying={currentlyPlaying} 
                toggleImageSelection={toggleImageSelection} 
                onDragEnd={onDragEnd} 
                handleMusicChange={handleMusicChange} 
                previewMusic={previewMusic} 
              />
              
              <SlideshowGenerationSection 
                isGeneratingSlideshow={isGeneratingSlideshow} 
                slideshowUrl={slideshowUrl} 
                slideshowError={slideshowError} 
                slideshowRenderId={slideshowRenderId} 
                generateSlideshow={generateSlideshow} 
                refetchSlideshowStatus={refetchSlideshowStatus} 
                onRegenerateSlideshow={handleRegenerateSlideshow} 
                selectedImages={selectedImages} 
                selectedMusic={selectedMusic}
                toggleImageSelection={toggleImageSelection}
              />
            </div>
          )}
          
          {/* For banner publication type */}
          {showBanner && (
            <div className="mb-4">
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
                onRegenerateBanner={handleRegenerateBanner} 
                listing={listing}
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

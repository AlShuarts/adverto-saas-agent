
import { ScrollArea } from "@/components/ui/scroll-area";
import { SlideshowGenerationSection } from "./SlideshowGenerationSection";
import { BannerGenerationSection } from "./BannerGenerationSection";
import { SlideshowConfig } from "../media-selector/SlideshowConfig";
import { PublicationType, PhotoType } from "../types";
import { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";

type MediaGenerationStepProps = {
  selectedPublicationType: PublicationType | null;
  selectedPhotoType?: PhotoType | null;
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
  selectedMusic?: string;
  toggleImageSelection: (imageUrl: string) => void;
  handleMusicChange: (music: string) => void;
  previewMusic: (musicName: string) => void;
  currentlyPlaying: string | null;
  listing: Tables<"listings">;
  musicList: string[];
  onDragEnd: (result: any) => void;
};

export const MediaGenerationStep = ({
  selectedPublicationType,
  selectedPhotoType,
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
  handleMusicChange,
  previewMusic,
  currentlyPlaying,
  listing,
  musicList,
  onDragEnd
}: MediaGenerationStepProps) => {
  
  const isMobile = useIsMobile();
  const showSlideshow = selectedPublicationType === "slideshow";
  const showBanner = selectedPhotoType === "banner";
  const availableImages = listing?.images || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Génération du contenu</h3>
      
      <ScrollArea className={isMobile ? "h-[50vh]" : "h-[55vh]"}>
        <div className="space-y-4 pr-2 pb-4">
          {showSlideshow && (
            <>
              <SlideshowConfig
                images={availableImages}
                selectedImages={selectedImages}
                musicList={musicList}
                selectedMusic={selectedMusic}
                currentlyPlaying={currentlyPlaying}
                toggleImageSelection={toggleImageSelection}
                handleMusicChange={handleMusicChange}
                previewMusic={previewMusic}
                onDragEnd={onDragEnd}
              />
              
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
              />
            </>
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

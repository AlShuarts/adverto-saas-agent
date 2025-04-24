import { MediaSelector } from "../media-selector";
import { PublicationType } from "../types";
import { MediaGenerationStep } from "../media-generation/MediaGenerationStep";
import { ScrollArea } from "@/components/ui/scroll-area";

type MediaStepProps = {
  selectedPublicationTypes: PublicationType[];
  images: string[];
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  musicList: string[];
  selectedMusic: string | undefined;
  currentlyPlaying: string | null;
  toggleImageSelection: (imageUrl: string) => void;
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
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  listing?: any;
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
  selectedPublicationTypes,
  images,
  selectedImages,
  bannerImage,
  bannerType,
  musicList,
  selectedMusic,
  currentlyPlaying,
  toggleImageSelection,
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
  const availableImages = listing?.images || images;
  
  const showSlideshow = selectedPublicationTypes.includes("slideshow");
  const showBanner = selectedPublicationTypes.includes("banner");
  
  return (
    <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Étape 3: Sélectionner les médias</h3>
        
        <MediaSelector
          selectedPublicationTypes={selectedPublicationTypes}
          images={availableImages}
          selectedImages={selectedImages}
          bannerImage={bannerImage}
          bannerType={bannerType}
          musicList={musicList}
          selectedMusic={selectedMusic}
          currentlyPlaying={currentlyPlaying}
          toggleImageSelection={toggleImageSelection}
          onDragEnd={onDragEnd}
          selectBannerImage={selectBannerImage}
          handleMusicChange={handleMusicChange}
          previewMusic={previewMusic}
          setBannerType={setBannerType}
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
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
        
        {(showSlideshow || showBanner) && (
          <MediaGenerationStep
            selectedPublicationTypes={selectedPublicationTypes}
            selectedImages={selectedImages}
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
            onRegenerateSlideshow={handleRegenerateSlideshow}
            onRegenerateBanner={handleRegenerateBanner}
            selectedMusic={selectedMusic}
            toggleImageSelection={toggleImageSelection}
            listing={listing}
          />
        )}
      </div>
    </ScrollArea>
  );
};

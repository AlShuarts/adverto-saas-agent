
import { SlideshowGenerationSection } from "../media-generation/SlideshowGenerationSection";
import { BannerGenerationSection } from "../media-generation/BannerGenerationSection";
import { PublicationType, PhotoType } from "../types";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowConfig } from "../media-selector/SlideshowConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageSelection } from "../media-generation/components/ImageSelection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-white`}>
          Configuration du média
        </h2>
        <p className={`${isMobile ? "text-sm" : "text-base"} text-gray-400`}>
          Personnalisez votre contenu avant la génération
        </p>
      </div>

      {/* For listing photos only */}
      {showListingPhotos && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className={`${isMobile ? "text-lg" : "text-xl"} text-white`}>
              Sélection des photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageSelection 
              selectedImages={selectedImages} 
              toggleImageSelection={toggleImageSelection} 
              availableImages={availableImages} 
              onSelectAll={() => selectAllImages(availableImages)} 
              onDeselectAll={deselectAllImages} 
            />
          </CardContent>
        </Card>
      )}
      
      {/* For slideshow publication type */}
      {showSlideshow && (
        <div className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className={`${isMobile ? "text-lg" : "text-xl"} text-white`}>
                Configuration du diaporama
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
          
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
      )}
    </div>
  );
};

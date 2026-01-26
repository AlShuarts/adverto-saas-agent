
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
  selectedFacebookImages: string[];
  selectedInstagramImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  musicList: string[];
  selectedMusic: string | undefined;
  currentlyPlaying: string | null;
  toggleFacebookImageSelection: (imageUrl: string) => void;
  toggleInstagramImageSelection: (imageUrl: string) => void;
  selectAllFacebookImages: (images: string[]) => void;
  selectAllInstagramImages: (images: string[]) => void;
  deselectAllFacebookImages: () => void;
  deselectAllInstagramImages: () => void;
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
  selectedFacebookImages,
  selectedInstagramImages,
  bannerImage,
  bannerType,
  musicList,
  selectedMusic,
  currentlyPlaying,
  toggleFacebookImageSelection,
  toggleInstagramImageSelection,
  selectAllFacebookImages,
  selectAllInstagramImages,
  deselectAllFacebookImages,
  deselectAllInstagramImages,
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

      {/* For listing photos only - now with separate Facebook/Instagram selections */}
      {showListingPhotos && (
        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className={`${isMobile ? "text-base" : "text-xl"} text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2`}>
                <span className="flex items-center gap-2 truncate">
                  <span className="text-blue-500 shrink-0">📘</span> 
                  <span className="truncate">Sélection Facebook</span>
                </span>
                <span className={`text-xs sm:text-sm font-normal whitespace-nowrap ${selectedFacebookImages.length >= 50 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  {selectedFacebookImages.length}/50 photos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFacebookImages.length >= 50 && (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-500">
                    ⚠️ Limite atteinte : Facebook accepte un maximum de 50 photos par publication
                  </p>
                </div>
              )}
              <ImageSelection 
                selectedImages={selectedFacebookImages} 
                toggleImageSelection={toggleFacebookImageSelection} 
                availableImages={availableImages} 
                onSelectAll={() => selectAllFacebookImages(availableImages)} 
                onDeselectAll={deselectAllFacebookImages} 
              />
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className={`${isMobile ? "text-base" : "text-xl"} text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2`}>
                <span className="flex items-center gap-2 truncate">
                  <span className="text-pink-500 shrink-0">📷</span> 
                  <span className="truncate">Sélection Instagram</span>
                </span>
                <span className={`text-xs sm:text-sm font-normal whitespace-nowrap ${selectedInstagramImages.length >= 10 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  {selectedInstagramImages.length}/10 photos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              {selectedInstagramImages.length >= 10 && (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-500">
                    ⚠️ Limite atteinte : Instagram n'accepte que 10 photos maximum
                  </p>
                </div>
              )}
              <ImageSelection 
                selectedImages={selectedInstagramImages} 
                toggleImageSelection={toggleInstagramImageSelection} 
                availableImages={availableImages} 
                onSelectAll={() => selectAllInstagramImages(availableImages)} 
                onDeselectAll={deselectAllInstagramImages} 
              />
            </CardContent>
          </Card>
        </div>
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
                selectedImages={selectedFacebookImages} 
                musicList={musicList} 
                selectedMusic={selectedMusic} 
                currentlyPlaying={currentlyPlaying} 
                toggleImageSelection={toggleFacebookImageSelection} 
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
            selectedImages={selectedFacebookImages} 
            selectedMusic={selectedMusic}
            toggleImageSelection={toggleFacebookImageSelection}
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
          selectedImages={selectedFacebookImages} 
          onRegenerateBanner={handleRegenerateBanner} 
          listing={listing}
        />
      )}
    </div>
  );
};

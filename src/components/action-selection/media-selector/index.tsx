
import { PhotoSelectionSection } from "./PhotoSelectionSection";
import { SlideshowConfig } from "./SlideshowConfig";
import { BannerImageSelector } from "./BannerImageSelector";
import { PublicationType } from "../types";

type MediaSelectorProps = {
  selectedPublicationTypes: PublicationType[];
  images: string[];
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  musicList: string[];
  selectedMusic?: string;
  currentlyPlaying: string | null;
  toggleImageSelection: (imageUrl: string) => void;
  selectAllImages: (images: string[]) => void;
  deselectAllImages: () => void;
  onDragEnd: (result: any) => void;
  selectBannerImage: (imageUrl: string) => void;
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  // Broker info props
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
};

export const MediaSelector = ({
  selectedPublicationTypes,
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
}: MediaSelectorProps) => {
  return (
    <div className="space-y-6">
      {selectedPublicationTypes.includes("photo") && (
        <PhotoSelectionSection 
          images={images}
          selectedImages={selectedImages}
          toggleImageSelection={toggleImageSelection}
          onSelectAll={() => selectAllImages(images)}
          onDeselectAll={deselectAllImages}
        />
      )}
      
      {selectedPublicationTypes.includes("slideshow") && (
        <SlideshowConfig
          images={images}
          selectedImages={selectedImages}
          toggleImageSelection={toggleImageSelection}
          onDragEnd={onDragEnd}
          musicList={musicList}
          selectedMusic={selectedMusic}
          currentlyPlaying={currentlyPlaying}
          handleMusicChange={handleMusicChange}
          previewMusic={previewMusic}
        />
      )}
      
      {selectedPublicationTypes.includes("banner") && (
        <div className="space-y-4">
          <h4 className="font-medium">Configuration de la bannière</h4>
          
          <BannerImageSelector
            images={images}
            bannerImage={bannerImage}
            selectBannerImage={selectBannerImage}
            bannerType={bannerType}
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
        </div>
      )}
    </div>
  );
};

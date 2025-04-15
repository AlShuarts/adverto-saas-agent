
import { MediaSelector } from "../media-selector";
import { PublicationType } from "../types";

type MediaStepProps = {
  selectedPublicationTypes: PublicationType[];
  images: string[];
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "À VENDRE";
  musicList: string[];
  selectedMusic: string | undefined;
  currentlyPlaying: string | null;
  toggleImageSelection: (imageUrl: string) => void;
  onDragEnd: (result: any) => void;
  selectBannerImage: (imageUrl: string) => void;
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
  setBannerType: (type: "VENDU" | "À VENDRE") => void;
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
  setFormErrors
}: MediaStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 3: Sélectionner les médias</h3>
      
      <MediaSelector
        selectedPublicationTypes={selectedPublicationTypes}
        images={images}
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
    </div>
  );
};

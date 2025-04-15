
import { SocialNetworkSelector } from "../SocialNetworkSelector";
import { PublicationPreview } from "../PublicationPreview";
import { PublicationType } from "../types";

type SocialNetworks = {
  facebook: boolean;
  instagram: boolean;
};

type SocialStepProps = {
  selectedNetworks: SocialNetworks;
  onNetworkChange: (networks: SocialNetworks) => void;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  images: string[];
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  selectedMusic: string | undefined;
  selectedPublicationTypes: PublicationType[];
};

export const SocialStep = ({
  selectedNetworks,
  onNetworkChange,
  generatedText,
  setGeneratedText,
  images,
  selectedImages,
  setSelectedImages,
  slideshowUrl,
  bannerUrl,
  selectedMusic,
  selectedPublicationTypes
}: SocialStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 4: Publier sur les réseaux sociaux</h3>
      
      <SocialNetworkSelector
        selectedNetworks={selectedNetworks}
        onNetworkChange={onNetworkChange}
      />
      
      <PublicationPreview
        selectedNetworks={selectedNetworks}
        generatedText={generatedText}
        setGeneratedText={setGeneratedText}
        images={images}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        slideshowUrl={slideshowUrl}
        bannerUrl={bannerUrl}
        selectedMusic={selectedMusic}
        selectedPublicationTypes={selectedPublicationTypes}
      />
    </div>
  );
};

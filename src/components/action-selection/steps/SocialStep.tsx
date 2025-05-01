import { SocialNetworkSelector } from "../SocialNetworkSelector";
import { PublicationType, SocialNetworks } from "../types";
import { Button } from "@/components/ui/button";
import { PublicationPreview } from "../PublicationPreview";
import { ScrollArea } from "@/components/ui/scroll-area";
type SocialStepProps = {
  selectedPublicationTypes: PublicationType[];
  selectedNetworks: SocialNetworks;
  setSelectedNetworks: (networks: SocialNetworks) => void;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
  hasRequiredInfo: boolean;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  images: string[];
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  selectedMusic: string | undefined;
  listing?: any; // Add listing prop
};
export const SocialStep = ({
  selectedPublicationTypes,
  selectedNetworks,
  setSelectedNetworks,
  isSubmitting,
  onSubmit,
  hasRequiredInfo,
  generatedText,
  setGeneratedText,
  images,
  selectedImages,
  setSelectedImages,
  slideshowUrl,
  bannerUrl,
  selectedMusic,
  listing
}: SocialStepProps) => {
  // Handle network change with explicit boolean conversion
  const handleNetworkChange = (network: keyof SocialNetworks, checked: boolean) => {
    setSelectedNetworks({
      ...selectedNetworks,
      [network]: checked
    });
  };

  // Make sure we have images available
  const availableImages = listing?.images || images;
  return <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 4 : Publier sur les réseaux sociaux</h3>
      
      <div className="space-y-4 border rounded-md p-4">
        <h4 className="font-medium">Sélection des réseaux</h4>
        <p className="text-sm text-muted-foreground">
          Choisissez les réseaux sociaux sur lesquels vous souhaitez publier votre contenu.
        </p>
        
        <SocialNetworkSelector selectedNetworks={selectedNetworks} onNetworkChange={handleNetworkChange} />
        
        <Button type="button" onClick={onSubmit} disabled={isSubmitting || !hasRequiredInfo || !selectedNetworks.facebook && !selectedNetworks.instagram} className="w-full sm:w-auto mt-4">
          {isSubmitting ? "Publication en cours..." : "Publier maintenant"}
        </Button>
      </div>

      {/* Publication Preview Section */}
      <div className="space-y-4 border rounded-md p-4">
        <h4 className="font-medium">Prévisualisation</h4>
        <p className="text-sm text-muted-foreground">
          Voici à quoi ressembleront vos publications sur les réseaux sociaux sélectionnés.
        </p>
        
        <ScrollArea className="h-[500px] w-full pr-4">
          <PublicationPreview selectedNetworks={selectedNetworks} generatedText={generatedText} setGeneratedText={setGeneratedText} images={availableImages} selectedImages={selectedImages} setSelectedImages={setSelectedImages} slideshowUrl={slideshowUrl} bannerUrl={bannerUrl} selectedMusic={selectedMusic} selectedPublicationTypes={selectedPublicationTypes} />
        </ScrollArea>
      </div>
    </div>;
};
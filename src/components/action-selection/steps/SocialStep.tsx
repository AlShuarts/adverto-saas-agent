
import { SocialNetworkSelector } from "../SocialNetworkSelector";
import { PublicationPreview } from "../PublicationPreview";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PublicationType, PhotoType, SocialNetworks } from "../types";
import { Tables } from "@/integrations/supabase/types";

// Local type for compatibility with PublicationPreview
type LocalPublicationType = "photo" | "slideshow" | "banner";

type SocialStepProps = {
  selectedPublicationType: PublicationType | null;
  selectedPhotoType?: PhotoType | null;
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
  selectedMusic?: string;
  listing: Tables<"listings">;
};

export const SocialStep = ({
  selectedPublicationType,
  selectedPhotoType,
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
  const handleSubmit = async () => {
    if (!hasRequiredInfo) return;
    await onSubmit();
  };

  // Convert single publication type to array for backward compatibility with PublicationPreview
  const selectedPublicationTypes: LocalPublicationType[] = [];
  
  if (selectedPublicationType === "slideshow") {
    selectedPublicationTypes.push("slideshow");
  } else if (selectedPhotoType === "banner") {
    selectedPublicationTypes.push("banner");
  } else if (selectedPhotoType === "listing_photos") {
    selectedPublicationTypes.push("photo");
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 6: Publication sur les réseaux sociaux</h3>
      
      <SocialNetworkSelector
        selectedNetworks={selectedNetworks}
        onNetworkChange={(network, checked) => {
          setSelectedNetworks({
            ...selectedNetworks,
            [network]: checked
          });
        }}
      />
      
      <PublicationPreview
        selectedPublicationTypes={selectedPublicationTypes}
        generatedText={generatedText}
        setGeneratedText={setGeneratedText}
        images={images}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        slideshowUrl={slideshowUrl}
        bannerUrl={bannerUrl}
        selectedMusic={selectedMusic}
        listing={listing}
        selectedNetworks={selectedNetworks}
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!hasRequiredInfo || isSubmitting || (!selectedNetworks.facebook && !selectedNetworks.instagram)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publication en cours...
            </>
          ) : (
            "Publier"
          )}
        </Button>
      </div>
    </div>
  );
};

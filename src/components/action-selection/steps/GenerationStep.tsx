
import { SlideshowStep } from "./SlideshowStep";
import { BannerStep } from "./BannerStep";
import { PublicationType } from "../types";

type GenerationStepProps = {
  selectedPublicationTypes: PublicationType[];
  isGeneratingSlideshow: boolean;
  slideshowUrl: string | null;
  slideshowError: string | null;
  slideshowRenderId: string | null;
  selectedImages: string[];
  onGenerateSlideshow: () => Promise<string | null>;
  onRegenerateSlideshow: () => void;
  onCheckStatus: () => void;
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  onGenerateBanner: () => Promise<{success?: boolean, errors?: Record<string, string>}>;
  onRegenerateBanner: () => void;
};

export const GenerationStep = ({
  selectedPublicationTypes,
  isGeneratingSlideshow,
  slideshowUrl,
  slideshowError,
  slideshowRenderId,
  selectedImages,
  onGenerateSlideshow,
  onRegenerateSlideshow,
  onCheckStatus,
  isGeneratingBanner,
  bannerUrl,
  bannerError,
  onGenerateBanner,
  onRegenerateBanner
}: GenerationStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 3.5: Génération des médias</h3>
      
      {selectedPublicationTypes.includes("slideshow") && (
        <SlideshowStep
          isGeneratingSlideshow={isGeneratingSlideshow}
          slideshowUrl={slideshowUrl}
          slideshowError={slideshowError}
          slideshowRenderId={slideshowRenderId}
          selectedImages={selectedImages}
          onGenerateSlideshow={onGenerateSlideshow}
          onRegenerateSlideshow={onRegenerateSlideshow}
          onCheckStatus={onCheckStatus}
        />
      )}
      
      {selectedPublicationTypes.includes("banner") && (
        <BannerStep
          isGeneratingBanner={isGeneratingBanner}
          bannerUrl={bannerUrl}
          bannerError={bannerError}
          onGenerateBanner={onGenerateBanner}
          onRegenerateBanner={onRegenerateBanner}
        />
      )}
    </div>
  );
};


import { GeneratingBanner } from "./GeneratingBanner";
import { BannerGenerationButton } from "./BannerGenerationButton";
import { BannerFormAlerts } from "./BannerFormAlerts";
import { BannerPreview } from "./BannerPreview";
import { BannerStatusChecker } from "./BannerStatusChecker";

type BannerGenerationContentProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerRenderId: string | null;
  generateBanner: () => Promise<void>;
  hasRequiredInfo: boolean;
  missingFields: string[];
  formErrors: { [key: string]: string };
  bannerError: string | null;
  onRegenerateBanner: () => void;
};

export const BannerGenerationContent = ({
  isGeneratingBanner,
  bannerUrl,
  bannerRenderId,
  generateBanner,
  hasRequiredInfo,
  missingFields,
  formErrors,
  bannerError,
  onRegenerateBanner
}: BannerGenerationContentProps) => {
  if (bannerUrl) {
    return <BannerPreview bannerUrl={bannerUrl} onRegenerate={onRegenerateBanner} />;
  }

  if (isGeneratingBanner) {
    return <GeneratingBanner />;
  }

  if (bannerRenderId) {
    return <BannerStatusChecker bannerRenderId={bannerRenderId} />;
  }

  return (
    <>
      <BannerGenerationButton 
        isGenerating={isGeneratingBanner} 
        hasRequiredInfo={hasRequiredInfo} 
        onClick={generateBanner} 
      />
      
      <BannerFormAlerts 
        hasRequiredInfo={hasRequiredInfo} 
        missingFields={missingFields} 
        formErrors={formErrors} 
        bannerError={bannerError} 
      />
    </>
  );
};

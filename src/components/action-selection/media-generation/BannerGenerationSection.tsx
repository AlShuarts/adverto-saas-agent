
import { ScrollArea } from "@/components/ui/scroll-area";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { useState, useEffect } from "react";
import { useBannerConfig } from "@/hooks/useBannerConfig";
import { BannerConfigurationHeader } from "./components/BannerConfigurationHeader";
import { SavedBrokerInfo } from "./components/SavedBrokerInfo";
import { PropertyImageSelection } from "./components/PropertyImageSelection";
import { BannerGenerationContent } from "./components/BannerGenerationContent";
import { Tables } from "@/integrations/supabase/types";

type BannerGenerationSectionProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  bannerRenderId: string | null;
  generateBanner: () => Promise<void>;
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  formErrors: {
    [key: string]: string;
  };
  setFormErrors: (errors: {
    [key: string]: string;
  }) => void;
  selectedImages: string[];
  onRegenerateBanner: () => void;
  listing: Tables<"listings">;
};

export const BannerGenerationSection = ({
  isGeneratingBanner,
  bannerUrl,
  bannerError,
  bannerRenderId,
  generateBanner,
  bannerImage,
  bannerType,
  setBannerType,
  selectBannerImage,
  brokerName,
  setBrokerName,
  brokerEmail,
  setBrokerEmail,
  brokerPhone,
  setBrokerPhone,
  brokerImageUrl,
  setBrokerImageUrl,
  agencyLogoUrl,
  setAgencyLogoUrl,
  formErrors,
  setFormErrors,
  selectedImages,
  onRegenerateBanner,
  listing
}: BannerGenerationSectionProps) => {
  const { config } = useBannerConfig();

  // Auto-load saved configuration
  useEffect(() => {
    if (config) {
      setBrokerName(config.brokerName || "");
      setBrokerEmail(config.brokerEmail || "");
      setBrokerPhone(config.brokerPhone || "");
      setBrokerImageUrl(config.brokerImageUrl);
      setAgencyLogoUrl(config.agencyLogoUrl);
    }
  }, [config, setBrokerName, setBrokerEmail, setBrokerPhone, setBrokerImageUrl, setAgencyLogoUrl]);

  const hasRequiredInfo = !!bannerImage && !!brokerName && !!brokerEmail && !!brokerPhone;
  const getMissingFields = () => {
    const missing = [];
    if (!bannerImage) missing.push("image de propriété");
    if (!brokerName) missing.push("nom du courtier");
    if (!brokerEmail) missing.push("email du courtier");
    if (!brokerPhone) missing.push("téléphone du courtier");
    return missing;
  };
  const missingFields = getMissingFields();

  return (
    <div className="space-y-4 border rounded-md p-4 bg-card">
      <BannerConfigurationHeader />
      
      <ScrollArea className="max-h-[500px] pr-4">
        <div className="space-y-6">
          <div className="space-y-4 border rounded-md p-4 bg-muted/30">
            <BannerTypeSelector 
              bannerType={bannerType} 
              setBannerType={setBannerType} 
              error={formErrors.bannerType} 
            />
          </div>
          
          <SavedBrokerInfo config={config} />
          
          <PropertyImageSelection
            selectedImages={selectedImages}
            bannerImage={bannerImage}
            selectBannerImage={selectBannerImage}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            listingImages={listing.images || []}
          />
        </div>
      </ScrollArea>
      
      <div className="border-t pt-4 mt-6">
        <div className="flex flex-col items-center justify-center py-4">
          <BannerGenerationContent
            isGeneratingBanner={isGeneratingBanner}
            bannerUrl={bannerUrl}
            bannerRenderId={bannerRenderId}
            generateBanner={generateBanner}
            hasRequiredInfo={hasRequiredInfo}
            missingFields={missingFields}
            formErrors={formErrors}
            bannerError={bannerError}
            onRegenerateBanner={onRegenerateBanner}
          />
        </div>
      </div>
    </div>
  );
};

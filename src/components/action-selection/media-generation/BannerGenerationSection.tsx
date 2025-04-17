
import { ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";
import { ImageUploader } from "@/components/banner/ImageUploader";
import { GeneratingBanner } from "./components/GeneratingBanner";
import { BannerGenerationButton } from "./components/BannerGenerationButton";
import { BannerFormAlerts } from "./components/BannerFormAlerts";
import { BannerPreview } from "./components/BannerPreview";

type BannerGenerationSectionProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
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
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  selectedImages: string[];
  onRegenerateBanner: () => void;
};

export const BannerGenerationSection = ({
  isGeneratingBanner,
  bannerUrl,
  bannerError,
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
  onRegenerateBanner
}: BannerGenerationSectionProps) => {
  
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
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium flex items-center space-x-2">
        <ImageIcon size={18} className="text-primary" />
        <span>Configuration de la bannière</span>
      </h4>
      
      <ScrollArea className="max-h-[500px] pr-4">
        <div className="space-y-6">
          <Accordion type="multiple" defaultValue={["banner-type", "broker-info", "banner-image"]} className="w-full">
            <AccordionItem value="banner-type">
              <AccordionTrigger className="text-sm font-medium">Type de bannière</AccordionTrigger>
              <AccordionContent className="p-2">
                <BannerTypeSelector
                  bannerType={bannerType}
                  setBannerType={setBannerType}
                  error={formErrors.bannerType}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="broker-info" defaultValue="broker-info">
              <AccordionTrigger className="text-sm font-medium">Informations du courtier</AccordionTrigger>
              <AccordionContent>
                <div className="p-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <ImageUploader
                      type="broker"
                      imageUrl={brokerImageUrl}
                      setImageUrl={setBrokerImageUrl}
                    />
                    
                    <ImageUploader
                      type="agency"
                      imageUrl={agencyLogoUrl}
                      setImageUrl={setAgencyLogoUrl}
                    />
                  </div>
                  
                  <Separator />
                  
                  <BrokerInfoForm
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
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="banner-image">
              <AccordionTrigger className="text-sm font-medium">Image de propriété</AccordionTrigger>
              <AccordionContent className="p-2">
                <PropertyImageSelector
                  images={selectedImages.length > 0 ? selectedImages : []}
                  selectedImage={bannerImage || ""}
                  setSelectedImage={selectBannerImage}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
      
      <div className="border-t pt-4 mt-6">
        {!bannerUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            {isGeneratingBanner ? (
              <GeneratingBanner />
            ) : (
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
            )}
          </div>
        ) : (
          <BannerPreview 
            bannerUrl={bannerUrl}
            onRegenerate={onRegenerateBanner}
          />
        )}
      </div>
    </div>
  );
};

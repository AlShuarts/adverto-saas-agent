
import { Loader2, Tag, User, Building, Mail, Phone, ImageIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { ImageUploader } from "@/components/banner/ImageUploader";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";
import { FormError } from "@/components/banner/FormError";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

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
          <Accordion type="multiple" defaultValue={["banner-image", "banner-type", "broker-info"]} className="w-full">
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
            
            <AccordionItem value="broker-info">
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
          </Accordion>
        </div>
      </ScrollArea>
      
      <div className="border-t pt-4 mt-6">
        {!hasRequiredInfo && (
          <Alert variant="default" className="mb-4 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              Des informations obligatoires sont manquantes: {missingFields.join(', ')}
            </AlertDescription>
          </Alert>
        )}
        
        {!bannerUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            {isGeneratingBanner ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Création de la bannière en cours...
                </p>
              </div>
            ) : (
              <>
                <Button 
                  onClick={generateBanner} 
                  disabled={isGeneratingBanner || !hasRequiredInfo}
                  className="w-full bg-primary hover:bg-primary/90"
                  variant={hasRequiredInfo ? "default" : "outline"}
                >
                  {isGeneratingBanner ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    hasRequiredInfo ? "Générer la bannière" : "Veuillez remplir tous les champs requis"
                  )}
                </Button>
                
                {Object.entries(formErrors).length > 0 && (
                  <div className="text-sm text-red-500 mt-2 p-2 bg-red-500/10 rounded-md w-full text-center">
                    Veuillez remplir correctement tous les champs requis.
                  </div>
                )}
                
                {bannerError && (
                  <div className="text-sm text-red-500 mt-2 p-2 bg-red-500/10 rounded-md w-full text-center">
                    {bannerError}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-500 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Bannière générée avec succès
              </span>
              <Button 
                variant="outline"
                onClick={onRegenerateBanner}
              >
                Régénérer
              </Button>
            </div>
            
            <div className="border rounded-md p-3 bg-muted/20 flex justify-center">
              <img 
                src={bannerUrl} 
                alt="Bannière générée" 
                className="max-h-[200px] shadow-md rounded-sm" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

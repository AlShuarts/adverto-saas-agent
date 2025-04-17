
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrokerInfoSection } from "./BrokerInfoSection";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { FormError } from "@/components/banner/FormError";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type BannerImageSelectorProps = {
  images: string[];
  bannerImage: string | null;
  selectBannerImage: (imageUrl: string) => void;
  bannerType: "VENDU" | "A_VENDRE";
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

export const BannerImageSelector = ({
  images,
  bannerImage,
  selectBannerImage,
  bannerType,
  setBannerType,
  // Broker info props
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
}: BannerImageSelectorProps) => {
  const hasRequiredInfo = !!bannerImage && !!brokerName && !!brokerEmail && !!brokerPhone;
  
  const missingFields = () => {
    const fields = [];
    if (!bannerImage) fields.push("image principale");
    if (!brokerName) fields.push("nom du courtier");
    if (!brokerEmail) fields.push("email du courtier");
    if (!brokerPhone) fields.push("téléphone du courtier");
    return fields;
  };
  
  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-muted/30">
        <Info className="h-4 w-4" />
        <AlertDescription>
          La création d'une bannière nécessite la sélection d'une image principale et les informations du courtier.
        </AlertDescription>
      </Alert>
      
      {images.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Aucune image disponible. Veuillez d'abord ajouter des images à la propriété.
          </AlertDescription>
        </Alert>
      )}
      
      {!hasRequiredInfo && images.length > 0 && (
        <Alert variant="default" className="bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Des informations obligatoires sont manquantes: {missingFields().join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="h-[500px]">
        <Accordion type="single" collapsible defaultValue="banner-type" className="w-full">
          <AccordionItem value="banner-type">
            <AccordionTrigger className="text-base font-medium">Type de bannière</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-2">
                <BannerTypeSelector 
                  bannerType={bannerType} 
                  setBannerType={setBannerType}
                  error={formErrors.bannerType}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="broker-info" defaultValue="broker-info">
            <AccordionTrigger className="text-base font-medium">Informations du courtier</AccordionTrigger>
            <AccordionContent>
              <BrokerInfoSection
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
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="banner-image">
            <AccordionTrigger className="text-base font-medium">Sélection de l'image principale</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Label className={formErrors.bannerImage ? "text-destructive" : ""}>Sélection de l'image principale *</Label>
                <ScrollArea className={`h-[220px] border rounded-lg p-2 ${formErrors.bannerImage ? "border-destructive" : ""}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
                    {images?.map(imageUrl => (
                      <div
                        key={imageUrl}
                        className={`relative cursor-pointer border-2 ${
                          bannerImage === imageUrl ? "border-primary" : "border-transparent"
                        } rounded overflow-hidden`}
                        onClick={() => {
                          selectBannerImage(imageUrl);
                          if (formErrors.bannerImage) {
                            const { bannerImage, ...rest } = formErrors;
                            setFormErrors(rest);
                          }
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt="Property"
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <FormError error={formErrors.bannerImage} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
};

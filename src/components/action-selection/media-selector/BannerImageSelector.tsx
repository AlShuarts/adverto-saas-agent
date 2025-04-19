
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle, ImageIcon } from "lucide-react";
import { FormError } from "@/components/banner/FormError";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";
import { ImageUploader } from "@/components/banner/ImageUploader";

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

      <div className="space-y-6">
        {/* Type de bannière */}
        <div className="space-y-4 border rounded-md p-4 bg-white">
          <h3 className="text-base font-medium">Type de bannière</h3>
          <BannerTypeSelector 
            bannerType={bannerType} 
            setBannerType={setBannerType}
            error={formErrors.bannerType}
          />
        </div>

        {/* Image principale */}
        <div className="space-y-2 border rounded-md p-4 bg-white">
          <h3 className="text-base font-medium">Image principale</h3>
          <Label className={formErrors.bannerImage ? "text-destructive" : ""}>
            <ImageIcon className="h-4 w-4 mr-2 inline-block text-muted-foreground" />
            Sélectionnez l'image principale *
          </Label>
          <ScrollArea className={`h-[220px] border rounded-lg p-2 ${formErrors.bannerImage ? "border-destructive" : ""}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
              {images?.map(imageUrl => (
                <div
                  key={imageUrl}
                  className={`relative cursor-pointer border-2 ${
                    bannerImage === imageUrl ? "border-primary" : "border-transparent"
                  } rounded overflow-hidden transition-all hover:opacity-90`}
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

        {/* Informations du courtier */}
        <div className="space-y-4 border rounded-md p-4 bg-white">
          <h3 className="text-base font-medium">Informations du courtier</h3>
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
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>
    </div>
  );
};

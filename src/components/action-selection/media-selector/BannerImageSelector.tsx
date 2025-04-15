
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrokerInfoSection } from "./BrokerInfoSection";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
      
      <div className="space-y-4 bg-muted/20 p-4 rounded-md">
        <h4 className="font-medium">1. Sélection du type de bannière et de l'image principale</h4>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="banner-type" className={formErrors.bannerType ? "text-destructive" : ""}>Type de bannière</Label>
            <RadioGroup 
              value={bannerType} 
              onValueChange={(value) => setBannerType(value as "VENDU" | "A_VENDRE")}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VENDU" id="vendu" />
                <Label htmlFor="vendu" className="cursor-pointer">VENDU</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A_VENDRE" id="a-vendre" />
                <Label htmlFor="a-vendre" className="cursor-pointer">À VENDRE</Label>
              </div>
            </RadioGroup>
            {formErrors.bannerType && (
              <p className="text-xs text-destructive mt-1">{formErrors.bannerType}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className={formErrors.bannerImage ? "text-destructive" : ""}>Sélection de l'image principale</Label>
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
            {formErrors.bannerImage && (
              <p className="text-xs text-destructive">{formErrors.bannerImage}</p>
            )}
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="bg-muted/20 p-4 rounded-md">
        <h4 className="font-medium mb-4">2. Information du courtier (requis pour la bannière)</h4>
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
      </div>
    </div>
  );
};

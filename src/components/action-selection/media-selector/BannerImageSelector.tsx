
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrokerInfoSection } from "./BrokerInfoSection";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

type BannerImageSelectorProps = {
  images: string[];
  bannerImage: string | null;
  selectBannerImage: (imageUrl: string) => void;
  bannerType: "VENDU" | "À VENDRE";
  setBannerType: (type: "VENDU" | "À VENDRE") => void;
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
      
      <div className="space-y-4 bg-muted/20 p-4 rounded-md">
        <h4 className="font-medium">1. Sélection du type de bannière et de l'image principale</h4>
        <div>
          <Label htmlFor="banner-type">Type de bannière</Label>
          <Select 
            value={bannerType} 
            onValueChange={(value) => setBannerType(value as "VENDU" | "À VENDRE")}
          >
            <SelectTrigger id="banner-type" className="mt-1">
              <SelectValue placeholder="Type de bannière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VENDU">VENDU</SelectItem>
              <SelectItem value="À VENDRE">À VENDRE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Sélection de l'image principale</Label>
          <ScrollArea className="h-[220px] border rounded-lg p-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
              {images?.map(imageUrl => (
                <div
                  key={imageUrl}
                  className={`relative cursor-pointer border-2 ${
                    bannerImage === imageUrl ? "border-primary" : "border-transparent"
                  } rounded overflow-hidden`}
                  onClick={() => selectBannerImage(imageUrl)}
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
        </div>
      </div>
      
      <Separator />
      
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


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/banner/ImageUploader";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";
import { Separator } from "@/components/ui/separator";

type BrokerInfoSectionProps = {
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

export const BrokerInfoSection = ({
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
}: BrokerInfoSectionProps) => {
  return (
    <div className="space-y-6 p-2">
      <div className="space-y-2">
        <h5 className="text-sm font-medium">Images (Optionnelles)</h5>
        <p className="text-xs text-muted-foreground">
          Ces images apparaîtront sur la bannière. Vous pouvez les téléverser ou continuer sans images.
        </p>
      </div>
      
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
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        <h5 className="text-sm font-medium">Informations de contact (Obligatoires)</h5>
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
    </div>
  );
};

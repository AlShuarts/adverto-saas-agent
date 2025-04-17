
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/banner/ImageUploader";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, User } from "lucide-react";

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
    <div className="space-y-6">
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
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="brokerName" className={`flex items-center ${formErrors.brokerName ? "text-destructive" : ""}`}>
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Nom du courtier *
            </Label>
            <Input
              id="brokerName"
              value={brokerName}
              onChange={(e) => {
                setBrokerName(e.target.value);
                if (formErrors.brokerName) {
                  const { brokerName, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              placeholder="Entrez le nom du courtier"
              className={formErrors.brokerName ? "border-destructive" : ""}
            />
            {formErrors.brokerName && (
              <p className="text-xs text-destructive">{formErrors.brokerName}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="brokerEmail" className={`flex items-center ${formErrors.brokerEmail ? "text-destructive" : ""}`}>
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              Email du courtier *
            </Label>
            <Input
              id="brokerEmail"
              type="email"
              value={brokerEmail}
              onChange={(e) => {
                setBrokerEmail(e.target.value);
                if (formErrors.brokerEmail) {
                  const { brokerEmail, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              placeholder="Entrez l'email du courtier"
              className={formErrors.brokerEmail ? "border-destructive" : ""}
            />
            {formErrors.brokerEmail && (
              <p className="text-xs text-destructive">{formErrors.brokerEmail}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="brokerPhone" className={`flex items-center ${formErrors.brokerPhone ? "text-destructive" : ""}`}>
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              Téléphone du courtier *
            </Label>
            <Input
              id="brokerPhone"
              type="tel"
              value={brokerPhone}
              onChange={(e) => {
                setBrokerPhone(e.target.value);
                if (formErrors.brokerPhone) {
                  const { brokerPhone, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              placeholder="Entrez le téléphone du courtier"
              className={formErrors.brokerPhone ? "border-destructive" : ""}
            />
            {formErrors.brokerPhone && (
              <p className="text-xs text-destructive">{formErrors.brokerPhone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

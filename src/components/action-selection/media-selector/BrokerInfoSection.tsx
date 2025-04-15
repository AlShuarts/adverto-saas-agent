
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'broker' | 'agency') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.includes('image/')) {
      toast.error("Le fichier doit être une image");
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (type === 'broker') {
          setBrokerImageUrl(reader.result);
        } else {
          setAgencyLogoUrl(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        setBrokerName(value);
        if (!value) {
          setFormErrors({ ...formErrors, brokerName: "Le nom du courtier est requis" });
        } else {
          const { brokerName, ...rest } = formErrors;
          setFormErrors(rest);
        }
        break;
      case 'email':
        setBrokerEmail(value);
        if (!value) {
          setFormErrors({ ...formErrors, brokerEmail: "L'email du courtier est requis" });
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          setFormErrors({ ...formErrors, brokerEmail: "Format d'email invalide" });
        } else {
          const { brokerEmail, ...rest } = formErrors;
          setFormErrors(rest);
        }
        break;
      case 'phone':
        setBrokerPhone(value);
        if (!value) {
          setFormErrors({ ...formErrors, brokerPhone: "Le téléphone du courtier est requis" });
        } else {
          const { brokerPhone, ...rest } = formErrors;
          setFormErrors(rest);
        }
        break;
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h4 className="font-medium">Information du courtier</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="broker-image">Image du courtier (optionnelle)</Label>
          <div className="mt-1 flex flex-col space-y-2">
            {brokerImageUrl && (
              <div className="relative w-24 h-24 mb-2">
                <img 
                  src={brokerImageUrl} 
                  alt="Courtier" 
                  className="w-24 h-24 object-cover rounded-md"
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                  onClick={() => setBrokerImageUrl(null)}
                >
                  ×
                </Button>
              </div>
            )}
            <Input
              id="broker-image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'broker')}
              className="cursor-pointer"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="agency-logo">Logo de l'agence (optionnel)</Label>
          <div className="mt-1 flex flex-col space-y-2">
            {agencyLogoUrl && (
              <div className="relative w-24 h-24 mb-2">
                <img 
                  src={agencyLogoUrl} 
                  alt="Agence" 
                  className="w-24 h-24 object-contain rounded-md bg-white p-1"
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                  onClick={() => setAgencyLogoUrl(null)}
                >
                  ×
                </Button>
              </div>
            )}
            <Input
              id="agency-logo"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'agency')}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mt-2">
        <div>
          <Label htmlFor="broker-name">Nom du courtier*</Label>
          <Input
            id="broker-name"
            value={brokerName}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={formErrors.brokerName ? "border-red-500" : ""}
          />
          {formErrors.brokerName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.brokerName}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="broker-email">Email du courtier*</Label>
          <Input
            id="broker-email"
            type="email"
            value={brokerEmail}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={formErrors.brokerEmail ? "border-red-500" : ""}
          />
          {formErrors.brokerEmail && (
            <p className="text-red-500 text-sm mt-1">{formErrors.brokerEmail}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="broker-phone">Téléphone du courtier*</Label>
          <Input
            id="broker-phone"
            value={brokerPhone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={formErrors.brokerPhone ? "border-red-500" : ""}
          />
          {formErrors.brokerPhone && (
            <p className="text-red-500 text-sm mt-1">{formErrors.brokerPhone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

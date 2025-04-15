
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, User, Building, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "broker" | "agency") => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('listings-images')
          .upload(fileName, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('listings-images')
          .getPublicUrl(fileName);
          
        if (type === "broker") {
          setBrokerImageUrl(publicUrl);
        } else {
          setAgencyLogoUrl(publicUrl);
        }

        toast.success("Image téléchargée avec succès");
      } catch (error: any) {
        console.error(`Erreur lors du téléchargement de l'image ${type}:`, error);
        toast.error("Erreur de téléchargement", {
          description: "Une erreur est survenue lors du téléchargement de l'image."
        });
      }
    }
  };

  // Handle input changes and validation
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
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-4 flex items-center">
        <Info className="w-4 h-4 mr-2" /> 
        Informations du courtier
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo du courtier */}
        <div className="space-y-2">
          <Label htmlFor="broker-image">Photo du courtier</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('broker-image-input')?.click()}
              type="button"
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <input
              id="broker-image-input"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "broker")}
            />
          </div>
          {brokerImageUrl && (
            <div className="w-20 h-20 rounded-full overflow-hidden mt-2">
              <img
                src={brokerImageUrl}
                alt="Photo du courtier"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        {/* Logo de l'agence */}
        <div className="space-y-2">
          <Label htmlFor="agency-logo">Logo de l'agence</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('agency-logo-input')?.click()}
              type="button"
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <input
              id="agency-logo-input"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "agency")}
            />
          </div>
          {agencyLogoUrl && (
            <div className="w-24 h-12 overflow-hidden mt-2">
              <img
                src={agencyLogoUrl}
                alt="Logo de l'agence"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Informations de contact du courtier */}
      <div className="grid grid-cols-1 gap-4 mt-4">
        <div>
          <Label htmlFor="broker-name" className={formErrors.brokerName ? "text-destructive" : ""}>
            Nom du courtier *
          </Label>
          <Input
            id="broker-name"
            value={brokerName}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nom du courtier"
            className={formErrors.brokerName ? "border-destructive" : ""}
          />
          {formErrors.brokerName && (
            <p className="text-xs text-destructive mt-1">{formErrors.brokerName}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="broker-email" className={formErrors.brokerEmail ? "text-destructive" : ""}>
            Email du courtier *
          </Label>
          <Input
            id="broker-email"
            value={brokerEmail}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Email du courtier"
            className={formErrors.brokerEmail ? "border-destructive" : ""}
          />
          {formErrors.brokerEmail && (
            <p className="text-xs text-destructive mt-1">{formErrors.brokerEmail}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="broker-phone" className={formErrors.brokerPhone ? "text-destructive" : ""}>
            Téléphone du courtier *
          </Label>
          <Input
            id="broker-phone"
            value={brokerPhone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Téléphone du courtier"
            className={formErrors.brokerPhone ? "border-destructive" : ""}
          />
          {formErrors.brokerPhone && (
            <p className="text-xs text-destructive mt-1">{formErrors.brokerPhone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

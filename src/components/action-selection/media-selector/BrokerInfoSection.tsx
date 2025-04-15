
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/banner/ImageUploader";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";

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
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-4 flex items-center">
        <Info className="w-4 h-4 mr-2" /> 
        Informations du courtier
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo du courtier */}
        <ImageUploader
          type="broker"
          imageUrl={brokerImageUrl}
          setImageUrl={setBrokerImageUrl}
        />
        
        {/* Logo de l'agence */}
        <ImageUploader
          type="agency"
          imageUrl={agencyLogoUrl}
          setImageUrl={setAgencyLogoUrl}
        />
      </div>
      
      {/* Informations de contact du courtier */}
      <div className="grid grid-cols-1 gap-4 mt-4">
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

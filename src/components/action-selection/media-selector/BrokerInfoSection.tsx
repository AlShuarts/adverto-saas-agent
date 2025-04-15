
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, User, Building, Info, Loader2 } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo du courtier et logo de l'agence */}
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
      
      <div className="space-y-4">
        <h5 className="text-sm font-medium flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Informations de contact du courtier
        </h5>
        
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

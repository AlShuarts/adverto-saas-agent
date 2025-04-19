
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PropertyImageSelector } from "../PropertyImageSelector";
import { BrokerInfoForm } from "../BrokerInfoForm";
import { ImageUploader } from "../ImageUploader";
import { BannerTypeSelector } from "../BannerTypeSelector";
import { Tables } from "@/integrations/supabase/types";

type DialogFormContentProps = {
  listing: Tables<"listings">;
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  brokerImage: string | null;
  setBrokerImage: (image: string | null) => void;
  agencyLogo: string | null;
  setAgencyLogo: (logo: string | null) => void;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
};

export const DialogFormContent = ({
  listing,
  selectedImage,
  setSelectedImage,
  brokerName,
  setBrokerName,
  brokerEmail,
  setBrokerEmail,
  brokerPhone,
  setBrokerPhone,
  brokerImage,
  setBrokerImage,
  agencyLogo,
  setAgencyLogo,
  bannerType,
  setBannerType,
  formErrors,
  setFormErrors
}: DialogFormContentProps) => {
  return (
    <div className="grid gap-4 py-4">
      {(!listing.images || listing.images.length === 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cette propriété n'a pas d'images. Veuillez d'abord ajouter des images à la propriété.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        {/* Type de bannière */}
        <div className="space-y-2 border rounded-md p-4 bg-white">
          <h3 className="text-base font-medium">Type de bannière</h3>
          <BannerTypeSelector bannerType={bannerType} setBannerType={setBannerType} />
        </div>
        
        {/* Sélection de l'image principale */}
        <div className="space-y-2 border rounded-md p-4 bg-white">
          <h3 className="text-base font-medium">Sélection de l'image principale</h3>
          <PropertyImageSelector 
            images={listing.images || []} 
            selectedImage={selectedImage} 
            setSelectedImage={setSelectedImage}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
          />
        </div>
        
        {/* Informations du courtier - Section visiblement mise en évidence */}
        <div className="space-y-2 border rounded-md p-4 bg-white">
          <h3 className="text-base font-medium text-primary font-bold border-b pb-2 mb-3">Informations du courtier</h3>
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
        
        {/* Images du courtier et de l'agence */}
        <div className="space-y-2 border rounded-md p-4 bg-white">
          <h3 className="text-base font-medium">Images du courtier et de l'agence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploader 
              type="broker" 
              imageUrl={brokerImage} 
              setImageUrl={setBrokerImage} 
            />
            
            <ImageUploader 
              type="agency" 
              imageUrl={agencyLogo} 
              setImageUrl={setAgencyLogo} 
            />
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mt-2">
        * Champs obligatoires
      </div>
    </div>
  );
};

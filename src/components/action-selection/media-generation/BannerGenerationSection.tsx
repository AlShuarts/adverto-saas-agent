
import { Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { BrokerInfoSection } from "@/components/action-selection/media-selector/BrokerInfoSection";

type BannerGenerationSectionProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  generateBanner: () => Promise<void>;
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  selectedImages: string[];
};

export const BannerGenerationSection = ({
  isGeneratingBanner,
  bannerUrl,
  bannerError,
  generateBanner,
  bannerImage,
  bannerType,
  setBannerType,
  selectBannerImage,
  brokerName,
  setBrokerName,
  brokerEmail,
  setBrokerEmail,
  brokerPhone,
  setBrokerPhone,
  brokerImageUrl,
  setBrokerImageUrl,
  agencyLogoUrl,
  setAgencyLogoUrl,
  formErrors,
  setFormErrors,
  selectedImages
}: BannerGenerationSectionProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium">Configuration de la bannière</h4>
      
      <div className="space-y-6">
        {/* Sélecteur d'image */}
        <PropertyImageSelector
          images={selectedImages.length > 0 ? selectedImages : []}
          selectedImage={bannerImage || ""}
          setSelectedImage={selectBannerImage}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
        
        {/* Type de bannière */}
        <BannerTypeSelector
          bannerType={bannerType}
          setBannerType={setBannerType}
          error={formErrors.bannerType}
        />
        
        {/* Informations du courtier */}
        <div className="border-t pt-4 mt-6">
          <h5 className="text-sm font-medium mb-4">Informations du courtier</h5>
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
      
      <div className="border-t pt-4 mt-6">
        <h4 className="font-medium mb-4">Génération de la bannière</h4>
        {!bannerUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            {isGeneratingBanner ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Création de la bannière en cours...
                </p>
              </div>
            ) : (
              <>
                <Button 
                  onClick={generateBanner} 
                  disabled={isGeneratingBanner}
                  className="w-full"
                >
                  {isGeneratingBanner ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : "Générer la bannière"}
                </Button>
                
                {Object.entries(formErrors).length > 0 && (
                  <div className="text-sm text-red-500 mt-2">
                    Veuillez remplir correctement tous les champs requis.
                  </div>
                )}
                
                {bannerError && (
                  <div className="text-sm text-red-500 mt-2">
                    {bannerError}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-500 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Bannière générée avec succès
              </span>
              <Button variant="outline">
                Régénérer
              </Button>
            </div>
            
            <div className="border rounded-md p-2 bg-muted/20">
              <img src={bannerUrl} alt="Bannière générée" className="max-h-[200px] mx-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

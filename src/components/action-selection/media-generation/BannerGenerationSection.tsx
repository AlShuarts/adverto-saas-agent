
import { ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";
import { ImageUploader } from "@/components/banner/ImageUploader";
import { GeneratingBanner } from "./components/GeneratingBanner";
import { BannerGenerationButton } from "./components/BannerGenerationButton";
import { BannerFormAlerts } from "./components/BannerFormAlerts";
import { BannerPreview } from "./components/BannerPreview";
import { useState, useEffect } from "react";
import { checkBannerStatusViaFunction } from "../hooks/generation/services/bannerService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BannerGenerationSectionProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  bannerRenderId: string | null;
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
  onRegenerateBanner: () => void;
};

export const BannerGenerationSection = ({
  isGeneratingBanner,
  bannerUrl,
  bannerError,
  bannerRenderId,
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
  selectedImages,
  onRegenerateBanner
}: BannerGenerationSectionProps) => {
  
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const hasRequiredInfo = !!bannerImage && !!brokerName && !!brokerEmail && !!brokerPhone;
  
  const getMissingFields = () => {
    const missing = [];
    if (!bannerImage) missing.push("image de propriété");
    if (!brokerName) missing.push("nom du courtier");
    if (!brokerEmail) missing.push("email du courtier");
    if (!brokerPhone) missing.push("téléphone du courtier");
    return missing;
  };
  
  const missingFields = getMissingFields();
  
  const checkStatus = async () => {
    if (!bannerRenderId) return;
    
    try {
      setIsCheckingStatus(true);
      const statusData = await checkBannerStatusViaFunction(bannerRenderId);
      
      if (statusData.status === "done" && statusData.url) {
        toast.success("Bannière prête !", {
          description: "La bannière a été générée avec succès."
        });
        window.location.reload(); // Actualise pour montrer la bannière
      } else {
        toast.info("Génération en cours", {
          description: `Statut actuel: ${statusData.status || "En attente"}`
        });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut:", error);
      toast.error("Erreur de vérification", {
        description: "Impossible de vérifier le statut de la bannière"
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4 bg-gray-900">
      <h4 className="font-medium flex items-center space-x-2 text-white">
        <ImageIcon size={18} className="text-primary" />
        <span>Configuration de la bannière</span>
      </h4>
      
      <ScrollArea className="max-h-[500px] pr-4">
        <div className="space-y-6">
          <div className="space-y-4 border rounded-md p-4 bg-gray-800">
            <h3 className="text-base font-medium text-white">Type de bannière</h3>
            <BannerTypeSelector
              bannerType={bannerType}
              setBannerType={setBannerType}
              error={formErrors.bannerType}
            />
          </div>
          
          <div className="space-y-4 border rounded-md p-4 bg-gray-800">
            <h3 className="text-base font-medium text-white">Informations du courtier</h3>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
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
                
                <Separator className="bg-gray-700" />
                
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
              </div>
            </ScrollArea>
          </div>
          
          <div className="space-y-2 border rounded-md p-4 bg-gray-800">
            <h3 className="text-base font-medium text-white">Image de propriété</h3>
            {selectedImages && selectedImages.length > 0 ? (
              <PropertyImageSelector
                images={selectedImages}
                selectedImage={bannerImage || ""}
                setSelectedImage={selectBannerImage}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
              />
            ) : (
              <div className="text-center p-4 bg-gray-700/50 rounded-md">
                <p className="text-gray-300">
                  Aucune image disponible. Veuillez sélectionner des images à l'étape précédente.
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <div className="border-t border-gray-700 pt-4 mt-6">
        {!bannerUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            {isGeneratingBanner ? (
              <GeneratingBanner />
            ) : bannerRenderId ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                  <p className="text-amber-500 font-medium">Bannière en cours de génération</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  La création de votre bannière est en cours de traitement. Cela peut prendre quelques minutes.
                </p>
                <Button 
                  variant="outline"
                  onClick={checkStatus}
                  disabled={isCheckingStatus}
                  className="mt-2"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : "Vérifier le statut"}
                </Button>
              </div>
            ) : (
              <>
                <BannerGenerationButton 
                  isGenerating={isGeneratingBanner} 
                  hasRequiredInfo={hasRequiredInfo}
                  onClick={generateBanner}
                />
                
                <BannerFormAlerts 
                  hasRequiredInfo={hasRequiredInfo}
                  missingFields={missingFields}
                  formErrors={formErrors}
                  bannerError={bannerError}
                />
              </>
            )}
          </div>
        ) : (
          <BannerPreview 
            bannerUrl={bannerUrl}
            onRegenerate={onRegenerateBanner}
          />
        )}
      </div>
    </div>
  );
};

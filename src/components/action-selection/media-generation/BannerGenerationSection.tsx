
import { ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { GeneratingBanner } from "./components/GeneratingBanner";
import { BannerGenerationButton } from "./components/BannerGenerationButton";
import { BannerFormAlerts } from "./components/BannerFormAlerts";
import { BannerPreview } from "./components/BannerPreview";
import { useState, useEffect } from "react";
import { checkBannerStatusViaFunction } from "../hooks/generation/services/bannerService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBannerConfig } from "@/hooks/useBannerConfig";

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
  formErrors: {
    [key: string]: string;
  };
  setFormErrors: (errors: {
    [key: string]: string;
  }) => void;
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
  const { config } = useBannerConfig();

  // Auto-load saved configuration
  useEffect(() => {
    if (config) {
      setBrokerName(config.brokerName || "");
      setBrokerEmail(config.brokerEmail || "");
      setBrokerPhone(config.brokerPhone || "");
      setBrokerImageUrl(config.brokerImageUrl);
      setAgencyLogoUrl(config.agencyLogoUrl);
    }
  }, [config, setBrokerName, setBrokerEmail, setBrokerPhone, setBrokerImageUrl, setAgencyLogoUrl]);

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
        window.location.reload();
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
    <div className="space-y-4 border rounded-md p-4 bg-card">
      <h4 className="font-medium flex items-center space-x-2">
        <ImageIcon size={18} className="text-primary" />
        <span>Configuration de la bannière</span>
      </h4>
      
      <ScrollArea className="max-h-[500px] pr-4">
        <div className="space-y-6">
          <div className="space-y-4 border rounded-md p-4 bg-muted/30">
            <BannerTypeSelector 
              bannerType={bannerType} 
              setBannerType={setBannerType} 
              error={formErrors.bannerType} 
            />
          </div>
          
          {/* Show saved broker info if available */}
          {config && (
            <div className="space-y-2 border rounded-md p-4 bg-muted/30">
              <h3 className="text-base font-medium">Informations du courtier (sauvegardées)</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Nom:</strong> {config.brokerName}</p>
                <p><strong>Email:</strong> {config.brokerEmail}</p>
                <p><strong>Téléphone:</strong> {config.brokerPhone}</p>
                {config.brokerImageUrl && <p><strong>Photo du courtier:</strong> Configurée</p>}
                {config.agencyLogoUrl && <p><strong>Logo de l'agence:</strong> Configuré</p>}
              </div>
            </div>
          )}
          
          <div className="space-y-2 border rounded-md p-4 bg-muted/30">
            <h3 className="text-base font-medium">Image de propriété</h3>
            {selectedImages && selectedImages.length > 0 ? (
              <PropertyImageSelector 
                images={selectedImages} 
                selectedImage={bannerImage || ""} 
                setSelectedImage={selectBannerImage} 
                formErrors={formErrors} 
                setFormErrors={setFormErrors} 
              />
            ) : (
              <div className="text-center p-4 bg-card/50 rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Aucune image disponible. Veuillez sélectionner des images à l'étape précédente.
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <div className="border-t pt-4 mt-6">
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
                <Button variant="outline" onClick={checkStatus} disabled={isCheckingStatus} className="mt-2">
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
          <BannerPreview bannerUrl={bannerUrl} onRegenerate={onRegenerateBanner} />
        )}
      </div>
    </div>
  );
};


import { Button } from "@/components/ui/button";
import { Loader2, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { checkBannerStatusViaFunction } from "../hooks/generation/services/bannerService";
import { toast } from "sonner";

type BannerStepProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  renderId: string | null;
  onGenerateBanner: () => Promise<void>;
  onRegenerateBanner: () => void;
};

export const BannerStep = ({
  isGeneratingBanner,
  bannerUrl,
  bannerError,
  renderId,
  onGenerateBanner,
  onRegenerateBanner,
}: BannerStepProps) => {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkStatus = async () => {
    if (!renderId) return;
    
    try {
      setIsCheckingStatus(true);
      const statusData = await checkBannerStatusViaFunction(renderId);
      
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

  useEffect(() => {
    // Si nous avons un renderId mais pas encore d'URL, vérifions le statut périodiquement
    if (renderId && !bannerUrl) {
      const interval = setInterval(() => {
        checkStatus();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [renderId, bannerUrl]);

  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium">Génération de la bannière</h4>
      
      {!bannerUrl ? (
        <div className="flex flex-col items-center justify-center py-4">
          {isGeneratingBanner ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Création de la bannière en cours...
              </p>
            </div>
          ) : renderId ? (
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
              <Button 
                onClick={onGenerateBanner} 
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
            <Button 
              variant="outline" 
              onClick={onRegenerateBanner}
            >
              Régénérer
            </Button>
          </div>
          
          <div className="border rounded-md p-2 bg-muted/20">
            <img src={bannerUrl} alt="Bannière générée" className="max-h-[200px] mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { checkBannerStatusViaFunction } from "../../hooks/generation/services/bannerService";
import { toast } from "sonner";

type BannerStatusCheckerProps = {
  bannerRenderId: string;
};

export const BannerStatusChecker = ({ bannerRenderId }: BannerStatusCheckerProps) => {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkStatus = async () => {
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
  );
};

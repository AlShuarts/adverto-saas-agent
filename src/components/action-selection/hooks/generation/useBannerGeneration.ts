
import { useState } from "react";
import { toast } from "sonner";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { createBanner, checkBannerStatus, type BrokerInfo } from "./services/bannerService";
import { validateBrokerInfo } from "./utils/bannerValidation";

export const useBannerGeneration = (listingId: string) => {
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const generateBanner = async (
    bannerImage: string | null, 
    bannerType: "VENDU" | "A_VENDRE",
    brokerInfo: BrokerInfo
  ) => {
    try {
      setIsGeneratingBanner(true);
      setBannerError(null);
      
      const { isValid, errors } = validateBrokerInfo(bannerImage, brokerInfo);
      if (!isValid) {
        throw new Error(`Veuillez remplir les champs suivants: ${errors.join(", ")}`);
      }
      
      toast.info("Création de la bannière", {
        description: "Nous préparons votre bannière...",
        duration: 3000
      });
      
      if (!bannerImage) return { success: false, error: "Image manquante" };
      
      const renderId = await createBanner(listingId, bannerImage, bannerType, brokerInfo);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isComplete && attempts < maxAttempts) {
        attempts++;
        const statusData = await checkBannerStatus(renderId);
        
        if (statusData && statusData.status === "completed" && statusData.image_url) {
          setBannerUrl(statusData.image_url);
          isComplete = true;
          toast.success("Bannière créée", {
            description: "La bannière a été générée avec succès.",
          });
          await ensureAndIncrementStatistic('banner');
        } else if (statusData && statusData.status === "failed") {
          throw new Error("La création de la bannière a échoué");
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      if (!isComplete) {
        throw new Error("Délai d'attente dépassé pour la génération de la bannière");
      }
      
      return { success: true };
      
    } catch (error) {
      console.error("Erreur lors de la création de la bannière:", error);
      setBannerError(error.message || "Une erreur est survenue lors de la création de la bannière");
      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue lors de la création de la bannière",
      });
      return { success: false, error: error.message };
    } finally {
      setIsGeneratingBanner(false);
    }
  };

  return {
    isGeneratingBanner,
    bannerUrl,
    bannerError,
    setBannerUrl,
    setIsGeneratingBanner,
    generateBanner
  };
};

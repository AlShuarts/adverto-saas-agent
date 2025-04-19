
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { toast } from "sonner";

type BrokerInfo = {
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
};

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
      
      if (!bannerImage) {
        throw new Error("Veuillez sélectionner une image principale pour la bannière");
      }
      
      if (!brokerInfo) {
        throw new Error("Informations du courtier manquantes");
      }
      
      const missingFields = [];
      if (!brokerInfo.brokerName) missingFields.push("nom du courtier");
      if (!brokerInfo.brokerEmail) missingFields.push("email du courtier");
      if (!brokerInfo.brokerPhone) missingFields.push("téléphone du courtier");
      
      if (missingFields.length > 0) {
        throw new Error(`Veuillez remplir les champs suivants: ${missingFields.join(', ')}`);
      }
      
      toast.info("Création de la bannière", {
        description: "Nous préparons votre bannière...",
        duration: 3000
      });
      
      const { data, error } = await supabase.functions.invoke("create-sold-banner", {
        body: {
          listingId: listingId,
          config: {
            bannerType: bannerType,
            mainImage: bannerImage,
            brokerName: brokerInfo.brokerName,
            brokerEmail: brokerInfo.brokerEmail,
            brokerPhone: brokerInfo.brokerPhone,
            brokerImage: brokerInfo.brokerImageUrl,
            agencyLogo: brokerInfo.agencyLogoUrl
          }
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.renderId) {
        throw new Error("Aucun ID de rendu n'a été retourné");
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isComplete && attempts < maxAttempts) {
        attempts++;
        const { data: statusData, error: statusError } = await supabase
          .from("sold_banner_renders")
          .select("image_url, status")
          .eq("render_id", data.renderId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (statusError) {
          if (attempts >= maxAttempts) throw statusError;
        }
        
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
    setIsGeneratingBanner, // Expose this setter
    generateBanner
  };
};

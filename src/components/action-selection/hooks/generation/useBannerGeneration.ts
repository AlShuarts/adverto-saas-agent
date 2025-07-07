
import { useState } from "react";
import { toast } from "sonner";

import { createBanner, checkBannerStatus, checkBannerStatusViaFunction, type BrokerInfo } from "./services/bannerService";
import { validateBrokerInfo } from "./utils/bannerValidation";

export const useBannerGeneration = (listingId: string) => {
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [renderId, setRenderId] = useState<string | null>(null);

  const generateBanner = async (
    bannerImage: string | null, 
    bannerType: "VENDU" | "A_VENDRE",
    brokerInfo: BrokerInfo
  ) => {
    try {
      setIsGeneratingBanner(true);
      setBannerError(null);
      setRenderId(null);
      
      // Log de débogage pour vérifier les données entrantes
      console.log("Données pour la génération de bannière:", {
        listingId,
        bannerImage: bannerImage ? "Image présente" : "Image manquante",
        bannerType,
        brokerInfo
      });
      
      const { isValid, errors } = validateBrokerInfo(bannerImage, brokerInfo);
      if (!isValid) {
        throw new Error(`Veuillez remplir les champs suivants: ${errors.join(", ")}`);
      }
      
      toast.info("Création de la bannière", {
        description: "Nous préparons votre bannière...",
        duration: 3000
      });
      
      if (!bannerImage) return { success: false, error: "Image manquante" };
      
      console.log("Appel à createBanner avec les paramètres:", {
        listingId,
        bannerType,
        brokerName: brokerInfo.brokerName,
        // Autres infos sensibles omises pour les logs
      });
      
      const newRenderId = await createBanner(listingId, bannerImage, bannerType, brokerInfo);
      console.log("RenderId reçu:", newRenderId);
      
      // Stocke le renderId pour pouvoir le vérifier plus tard
      setRenderId(newRenderId);
      
      // Attendre un court moment avant de commencer à vérifier le statut
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 15;
      
      while (!isComplete && attempts < maxAttempts) {
        attempts++;
        console.log(`Vérification du statut de la bannière (tentative ${attempts}/${maxAttempts})...`);
        
        try {
          // Vérification directe dans la base de données
          const statusData = await checkBannerStatus(newRenderId);
          console.log("Statut reçu de la DB:", statusData);
          
          if (statusData && statusData.status === "completed" && statusData.image_url) {
            setBannerUrl(statusData.image_url);
            isComplete = true;
            toast.success("Bannière créée", {
              description: "La bannière a été générée avec succès.",
            });
            break;
          }
          
          if (statusData && statusData.status === "failed") {
            throw new Error("La création de la bannière a échoué");
          }
          
          // Si pas complété, vérifie également via la fonction edge qui interroge directement l'API Shotstack
          if (attempts % 3 === 0) { // Vérifie via l'edge function toutes les 3 tentatives
            const apiStatusData = await checkBannerStatusViaFunction(newRenderId);
            console.log("Statut reçu de l'API:", apiStatusData);
            
            if (apiStatusData && (apiStatusData.status === "done" || apiStatusData.url)) {
              if (apiStatusData.url) {
                setBannerUrl(apiStatusData.url);
                isComplete = true;
                toast.success("Bannière créée", {
                  description: "La bannière a été générée avec succès.",
                });
                break;
              }
            }
          }
          
          console.log("Attente avant la prochaine vérification...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (checkError) {
          console.error("Erreur lors de la vérification du statut:", checkError);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      if (!isComplete) {
        // Si toujours pas complété mais qu'on a un renderId, on place l'interface en attente
        // et on confie la vérification au composant SoldBannerStatus
        if (newRenderId) {
          toast.info("Génération de la bannière en cours", {
            description: "La création de votre bannière prend plus de temps que prévu. Vous recevrez une notification lorsqu'elle sera prête.",
            duration: 5000
          });
          return { success: true, pending: true, renderId: newRenderId };
        } else {
          throw new Error("Délai d'attente dépassé pour la génération de la bannière");
        }
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
    renderId,
    setRenderId,
    setBannerUrl,
    setIsGeneratingBanner,
    generateBanner
  };
};

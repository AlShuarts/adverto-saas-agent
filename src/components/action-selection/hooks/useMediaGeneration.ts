
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { toast } from "sonner";

export const useMediaGeneration = (listingId: string) => {
  const [isGeneratingSlideshow, setIsGeneratingSlideshow] = useState(false);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [slideshowError, setSlideshowError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [slideshowRenderId, setSlideshowRenderId] = useState<string | null>(null);

  const generateSlideshow = async (selectedImages: string[], selectedMusic?: string): Promise<string | null> => {
    try {
      setIsGeneratingSlideshow(true);
      setSlideshowError(null);
      
      console.log("Génération du diaporama pour le listing:", listingId);
      console.log("Images sélectionnées:", selectedImages);
      console.log("Musique sélectionnée:", selectedMusic);
      
      toast.info("Génération du diaporama", {
        description: "Nous préparons votre diaporama...",
        duration: 3000
      });
      
      const { data, error } = await supabase.functions.invoke("create-slideshow", {
        body: {
          listingId: listingId,
          config: {
            imageDuration: 3,
            showDetails: true,
            showPrice: true,
            showAddress: true,
            selectedImages: selectedImages,
            selectedMusic: selectedMusic
          }
        }
      });
      
      if (error) {
        console.error("Erreur lors de l'appel à create-slideshow:", error);
        throw error;
      }
      
      console.log("Réponse de create-slideshow:", data);
      
      if (data.renderId) {
        setSlideshowRenderId(data.renderId);
        
        await ensureAndIncrementStatistic('slideshow');
        
        toast.success("Diaporama en cours de génération", {
          description: "Ce processus peut prendre quelques minutes",
          duration: 5000
        });
        
        return data.renderId;
      } else {
        throw new Error("Aucun ID de rendu n'a été retourné");
      }
      
    } catch (error) {
      console.error("Erreur lors de la génération du diaporama:", error);
      setSlideshowError("Une erreur est survenue lors de la génération du diaporama: " + (error.message || "erreur inconnue"));
      toast.error("Erreur lors de la génération du diaporama", {
        description: error.message || "Une erreur inattendue est survenue",
        duration: 5000
      });
      return null;
    } finally {
      setIsGeneratingSlideshow(false);
    }
  };

  const generateBanner = async (
    bannerImage: string | null, 
    bannerType: "VENDU" | "A_VENDRE",
    brokerInfo: {
      brokerImageUrl: string | null;
      agencyLogoUrl: string | null;
      brokerName: string;
      brokerEmail: string;
      brokerPhone: string;
    }
  ) => {
    try {
      setIsGeneratingBanner(true);
      setBannerError(null);
      
      // Validate required fields
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
      
      console.log("Génération de la bannière pour le listing:", listingId);
      console.log("Image principale:", bannerImage);
      console.log("Type de bannière:", bannerType);
      console.log("Informations du courtier:", brokerInfo);
      
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
      
      console.log("Réponse de create-sold-banner:", data);
      
      if (!data || !data.renderId) {
        throw new Error("Aucun ID de rendu n'a été retourné");
      }
      
      // Attendre 3 secondes avant de vérifier le statut
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 10; // Maximum attempts to check status
      
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
          console.error("Erreur lors de la vérification du statut:", statusError);
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
          // Attendre 5 secondes avant la prochaine vérification
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
    isGeneratingSlideshow,
    isGeneratingBanner,
    slideshowUrl,
    bannerUrl,
    slideshowError,
    bannerError,
    slideshowRenderId,
    setSlideshowUrl,
    setBannerUrl,
    setIsGeneratingSlideshow,
    setIsGeneratingBanner,
    setSlideshowRenderId,
    generateSlideshow,
    generateBanner
  };
};


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
    brokerInfo?: {
      brokerImageUrl: string | null;
      agencyLogoUrl: string | null;
      brokerName: string;
      brokerEmail: string;
      brokerPhone: string;
    }
  ) => {
    if (!bannerImage) {
      toast.error("Erreur", {
        description: "Veuillez sélectionner une image pour la bannière.",
      });
      return { errors: { bannerImage: "Veuillez sélectionner une image" } };
    }

    // Validate broker info if needed
    if (brokerInfo) {
      const errors: Record<string, string> = {};
      
      if (brokerInfo.brokerName && brokerInfo.brokerName.trim() === '') {
        errors.brokerName = "Veuillez fournir un nom de courtier";
      }
      if (brokerInfo.brokerEmail && !brokerInfo.brokerEmail.includes('@')) {
        errors.brokerEmail = "Veuillez fournir un email valide";
      }
      if (brokerInfo.brokerPhone && brokerInfo.brokerPhone.trim() === '') {
        errors.brokerPhone = "Veuillez fournir un numéro de téléphone";
      }
      
      if (Object.keys(errors).length > 0) {
        return { errors };
      }
    }
    
    try {
      setIsGeneratingBanner(true);
      setBannerError(null);
      
      const { data, error } = await supabase.functions.invoke("create-sold-banner", {
        body: {
          listingId: listingId,
          config: {
            bannerType: bannerType,
            mainImage: bannerImage,
            ...brokerInfo
          }
        }
      });
      
      if (error) throw error;
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let isComplete = false;
      while (!isComplete) {
        const { data: statusData } = await supabase
          .from("sold_banner_renders")
          .select("image_url, status")
          .eq("listing_id", listingId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
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
      
      return { success: true };
      
    } catch (error) {
      console.error("Erreur lors de la création de la bannière:", error);
      setBannerError("Une erreur est survenue: " + error.message);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la création de la bannière.",
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

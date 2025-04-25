
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { toast } from "sonner";

// Define the interface for the slideshow configuration
interface SlideshowConfig {
  imageDuration: number;
  showDetails: boolean;
  showPrice: boolean;
  showAddress: boolean;
  selectedImages: string[];
  selectedMusic?: string;
  musicUrl?: string;
}

export const useSlideshowGeneration = (listingId: string) => {
  const [isGeneratingSlideshow, setIsGeneratingSlideshow] = useState(false);
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null);
  const [slideshowError, setSlideshowError] = useState<string | null>(null);
  const [slideshowRenderId, setSlideshowRenderId] = useState<string | null>(null);

  const generateSlideshow = async (selectedImages: string[], selectedMusic?: string): Promise<string | null> => {
    try {
      setIsGeneratingSlideshow(true);
      setSlideshowError(null);
      
      console.log("Génération du diaporama pour le listing:", listingId);
      console.log("Images sélectionnées:", selectedImages);
      console.log("Musique sélectionnée:", selectedMusic || "aucune musique");
      
      toast.info("Génération du diaporama", {
        description: "Nous préparons votre diaporama...",
        duration: 3000
      });
      
      // Préparation du payload en s'assurant que selectedMusic est bien inclus
      const payload = {
        listingId: listingId,
        config: {
          imageDuration: 3,
          showDetails: true,
          showPrice: true,
          showAddress: true,
          selectedImages: selectedImages,
          // S'assurer que selectedMusic est explicitement inclus, même s'il est undefined
          selectedMusic: selectedMusic || null
        }
      };
      
      console.log("Payload envoyé à la fonction:", JSON.stringify(payload, null, 2));
      
      const { data, error } = await supabase.functions.invoke("create-slideshow", {
        body: payload
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
  
  const refetchSlideshowStatus = useCallback(async () => {
    if (slideshowRenderId) {
      console.log("Vérification manuelle du statut du diaporama:", slideshowRenderId);
      
      try {
        const { data, error } = await supabase.functions.invoke('check-render-status', {
          body: { renderId: slideshowRenderId }
        });
        
        if (error) {
          console.error("Erreur lors de la vérification du statut:", error);
          return;
        }
        
        console.log("Réponse de la vérification du statut:", data);
        
        if (data.status === 'done' && data.url) {
          setSlideshowUrl(data.url);
          toast.success("Votre diaporama est prêt !");
        } else if (data.status === 'failed') {
          setSlideshowError("La génération du diaporama a échoué");
          toast.error("La génération du diaporama a échoué");
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du statut:", err);
      }
    }
  }, [slideshowRenderId]);

  return {
    isGeneratingSlideshow,
    slideshowUrl,
    slideshowError,
    slideshowRenderId,
    setSlideshowUrl,
    setIsGeneratingSlideshow,
    setSlideshowRenderId,
    generateSlideshow,
    refetchSlideshowStatus
  };
};

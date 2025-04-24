
import { useEffect, useState, useCallback } from 'react';
import { useSlideshowStatus } from '@/hooks/useSlideshowStatus';
import { PublicationType } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useSlideshowMonitor = (
  listingId: string,
  selectedPublicationTypes: PublicationType[],
  slideshowRenderId: string | null,
  setSlideshowUrl: (url: string | null) => void,
  setIsGeneratingSlideshow: (isGenerating: boolean) => void,
) => {
  const { 
    data: slideshowRender, 
    isLoading: isSlideshowStatusLoading,
    error: slideshowStatusError,
    refetch: refetchSlideshowStatus
  } = useSlideshowStatus(listingId);
  
  // Ajout d'un état local pour les vérifications en cours
  const [isCheckingManually, setIsCheckingManually] = useState(false);

  // Cette fonction force une vérification directe avec l'API Shotstack
  const forceCheckRenderStatus = useCallback(async () => {
    if (!slideshowRender?.render_id) {
      console.log("Aucun ID de rendu disponible pour vérification");
      return;
    }
    
    setIsCheckingManually(true);
    try {
      console.log("Vérification manuelle du statut avec l'API pour:", slideshowRender.render_id);
      const response = await supabase.functions.invoke('check-render-status', {
        body: { renderId: slideshowRender.render_id }
      });
      
      if (response.error) {
        console.error("Erreur lors de la vérification manuelle:", response.error);
        toast.error("Erreur lors de la vérification du statut");
      } else if (response.data) {
        console.log("Réponse de la vérification manuelle:", response.data);
        
        // Si le rendu est terminé, mettre à jour localement
        if (response.data.status === "done" || response.data.status === "completed") {
          if (response.data.videoUrl || response.data.url) {
            setSlideshowUrl(response.data.videoUrl || response.data.url);
            setIsGeneratingSlideshow(false);
            toast.success("Diaporama généré avec succès");
          }
        } else if (response.data.status === "failed" || response.data.status === "error") {
          setIsGeneratingSlideshow(false);
          toast.error("Échec de la génération du diaporama");
        } else {
          toast.info(`Statut actuel: ${response.data.status}`);
        }
        
        // Rafraîchir l'état depuis la base de données
        await refetchSlideshowStatus();
      }
    } catch (err) {
      console.error("Erreur lors de la vérification forcée:", err);
      toast.error("Erreur lors de la vérification");
    } finally {
      setIsCheckingManually(false);
    }
  }, [slideshowRender, refetchSlideshowStatus, setSlideshowUrl, setIsGeneratingSlideshow]);

  // Amélioration de la fonction de refetch pour combiner la requête de base et la vérification manuelle
  const enhancedRefetchStatus = useCallback(() => {
    console.log("Vérification améliorée du statut du slideshow");
    
    // Commencer par rafraîchir l'état depuis la base de données
    refetchSlideshowStatus().then(() => {
      // Puis forcer une vérification avec l'API si nécessaire
      if (slideshowRender?.render_id && 
         (slideshowRender.status === "pending" || 
          slideshowRender.status === "processing" || 
          slideshowRender.status === "rendering" ||
          slideshowRender.status === "fetching")) {
        forceCheckRenderStatus();
      }
    });
  }, [refetchSlideshowStatus, slideshowRender, forceCheckRenderStatus]);

  useEffect(() => {
    if (slideshowRender && selectedPublicationTypes.includes("slideshow")) {
      if ((slideshowRender.status === "completed" || slideshowRender.status === "done") && slideshowRender.video_url) {
        setSlideshowUrl(slideshowRender.video_url);
        setIsGeneratingSlideshow(false);
        toast.success("Diaporama généré avec succès");
      } 
      
      else if (slideshowRender.status === "error" || slideshowRender.status === "failed") {
        setIsGeneratingSlideshow(false);
        toast.error("Échec de la génération du diaporama");
      }
      
      else if (slideshowRender.status === "pending" || slideshowRender.status === "processing" || slideshowRender.status === "rendering" || slideshowRender.status === "fetching") {
        if (slideshowRenderId) {
          // Planifier une vérification toutes les 5 secondes
          const checkTimer = setTimeout(() => {
            console.log("Vérification périodique du statut du diaporama...");
            
            // Alterner entre la vérification régulière et la vérification manuelle
            if (Math.random() > 0.5) {
              forceCheckRenderStatus();
            } else {
              refetchSlideshowStatus();
            }
          }, 5000);
          
          return () => clearTimeout(checkTimer);
        }
      }
    }
  }, [slideshowRender, refetchSlideshowStatus, forceCheckRenderStatus, slideshowRenderId, selectedPublicationTypes, setSlideshowUrl, setIsGeneratingSlideshow]);

  return {
    slideshowRender,
    isSlideshowStatusLoading,
    slideshowStatusError,
    refetchSlideshowStatus: enhancedRefetchStatus,
    forceCheckRenderStatus,
    isCheckingManually
  };
};

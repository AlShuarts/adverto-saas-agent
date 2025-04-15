
import { useEffect } from 'react';
import { useSlideshowStatus } from '@/hooks/useSlideshowStatus';
import { PublicationType } from './types';
import { toast } from 'sonner';

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
      
      else if (slideshowRender.status === "pending" || slideshowRender.status === "processing" || slideshowRender.status === "rendering") {
        if (slideshowRenderId) {
          const checkTimer = setTimeout(() => {
            console.log("Vérification périodique du statut du diaporama...");
            refetchSlideshowStatus();
          }, 5000);
          
          return () => clearTimeout(checkTimer);
        }
      }
    }
  }, [slideshowRender, refetchSlideshowStatus, slideshowRenderId, selectedPublicationTypes]);

  return {
    slideshowRender,
    isSlideshowStatusLoading,
    slideshowStatusError,
    refetchSlideshowStatus
  };
};

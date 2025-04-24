
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSlideshowMonitor = (
  listingId: string,
  selectedPublicationTypes: string[],
  slideshowRenderId: string | null,
  setSlideshowUrl: (url: string | null) => void,
  setIsGeneratingSlideshow: (isGenerating: boolean) => void
) => {
  const [lastCheckedTime, setLastCheckedTime] = useState<number>(0);
  
  const fetchSlideshowStatus = useCallback(async () => {
    if (!slideshowRenderId) return null;

    setLastCheckedTime(Date.now());
    
    try {
      console.log("Vérification du statut du diaporama pour le renderId:", slideshowRenderId);
      const { data, error } = await supabase.functions.invoke('check-render-status', {
        body: { renderId: slideshowRenderId }
      });
      
      if (error) {
        console.error("Erreur lors de la vérification du statut:", error);
        throw error;
      }
      
      console.log("Réponse de la vérification du statut:", data);
      
      if (data.status === 'done' && data.url) {
        console.log("✅ Diaporama prêt! URL:", data.url);
        setSlideshowUrl(data.url);
        setIsGeneratingSlideshow(false);
        return data;
      } else if (data.status === 'failed') {
        console.error("❌ Échec de la génération du diaporama");
        setIsGeneratingSlideshow(false);
      } else {
        console.log("⏳ Diaporama toujours en cours de traitement, statut:", data.status);
      }
      
      return data;
    } catch (err) {
      console.error("Erreur lors de la vérification du statut du diaporama:", err);
      return null;
    }
  }, [slideshowRenderId, setSlideshowUrl, setIsGeneratingSlideshow]);

  // Auto-polling query
  const { refetch } = useQuery({
    queryKey: ['slideshowStatus', slideshowRenderId],
    queryFn: fetchSlideshowStatus,
    enabled: !!slideshowRenderId && selectedPublicationTypes.includes('slideshow'),
    refetchInterval: 15000, // 15 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  // Manuel refetch function with immediate execution
  const refetchSlideshowStatus = useCallback(() => {
    console.log("Vérification manuelle du statut du diaporama");
    return fetchSlideshowStatus();
  }, [fetchSlideshowStatus]);

  return {
    refetchSlideshowStatus
  };
};

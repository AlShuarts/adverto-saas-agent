
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSlideshowMonitor = (
  listingId: string,
  selectedPublicationTypes: string[],
  slideshowRenderId: string | null,
  setSlideshowUrl: (url: string | null) => void,
  setIsGeneratingSlideshow: (isGenerating: boolean) => void
) => {
  const [lastCheckedTime, setLastCheckedTime] = useState<number>(0);
  const [isManualChecking, setIsManualChecking] = useState(false);
  
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
      
      if (data.status === 'done' && (data.url || data.videoUrl)) {
        const finalUrl = data.videoUrl || data.url;
        console.log("✅ Diaporama prêt! URL:", finalUrl);
        setSlideshowUrl(finalUrl);
        setIsGeneratingSlideshow(false);
        toast.success("Votre diaporama est prêt !", {
          description: "Vous pouvez maintenant le prévisualiser.",
          duration: 5000
        });
        return data;
      } else if (data.status === 'failed' || data.status === 'error') {
        console.error("❌ Échec de la génération du diaporama");
        setIsGeneratingSlideshow(false);
        toast.error("Échec de la génération du diaporama", {
          description: "Veuillez réessayer ultérieurement.",
          duration: 5000
        });
      } else {
        console.log("⏳ Diaporama toujours en cours de traitement, statut:", data.status);
      }
      
      return data;
    } catch (err) {
      console.error("Erreur lors de la vérification du statut du diaporama:", err);
      // Si erreur lors de la vérification, ne pas montrer d'erreur à l'utilisateur
      // mais continuer à attendre
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
  const refetchSlideshowStatus = useCallback(async () => {
    console.log("Vérification manuelle du statut du diaporama");
    setIsManualChecking(true);
    try {
      await fetchSlideshowStatus();
    } finally {
      setTimeout(() => setIsManualChecking(false), 1000);
    }
  }, [fetchSlideshowStatus]);

  return {
    refetchSlideshowStatus,
    isManualChecking
  };
};

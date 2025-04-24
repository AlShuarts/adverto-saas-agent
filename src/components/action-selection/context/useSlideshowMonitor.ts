
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
      console.log("Fetching slideshow status for renderId:", slideshowRenderId);
      const { data, error } = await supabase.functions.invoke('check-render-status', {
        body: { renderId: slideshowRenderId }
      });
      
      if (error) throw error;
      console.log("Slideshow status response:", data);
      
      if (data.status === 'done' && data.url) {
        setSlideshowUrl(data.url);
        setIsGeneratingSlideshow(false);
        return data;
      } else if (data.status === 'failed') {
        console.error("Slideshow rendering failed");
        setIsGeneratingSlideshow(false);
      }
      
      return data;
    } catch (err) {
      console.error("Error fetching slideshow status:", err);
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
    console.log("Manual refetch of slideshow status triggered");
    return fetchSlideshowStatus();
  }, [fetchSlideshowStatus]);

  return {
    refetchSlideshowStatus
  };
};

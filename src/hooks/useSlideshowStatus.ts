
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type SlideshowRender = Tables<"slideshow_renders">;

export const useSlideshowStatus = (listingId: string) => {
  return useQuery<SlideshowRender | null>({
    queryKey: ["slideshow-status", listingId],
    queryFn: async () => {
      try {
        console.log("Fetching slideshow status for listing ID:", listingId);
        
        const { data: renders, error } = await supabase
          .from("slideshow_renders")
          .select("*")
          .eq("listing_id", listingId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching render status:", error);
          return null;
        }

        if (!renders || renders.length === 0) {
          console.log("No render found for listing ID:", listingId);
          return null;
        }
        
        const render = renders[0];
        console.log("Retrieved render status:", render);

        // If the render is in pending or processing state, check with Shotstack API
        if (render && (render.status === 'pending' || render.status === 'processing')) {
          try {
            console.log("Checking render status for ID:", render.render_id);
            
            // Make 3 attempts to check the status with a short delay between them
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
              try {
                if (!render.render_id) {
                  console.error("Missing render_id for Shotstack status check");
                  break;
                }
                
                const response = await supabase.functions.invoke('check-render-status', {
                  body: { renderId: render.render_id }
                });
                
                console.log('Full check-render-status response:', response);
                
                if (response.error) {
                  console.error('Error from check-render-status:', response.error);
                  attempts++;
                  
                  if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between attempts
                  }
                  continue;
                }
                
                if (response.data) {
                  console.log('Render status check response data:', response.data);
                  
                  // Si le statut a changé, mettre à jour le rendu local
                  if (response.data.status) {
                    // Convertir "done" en "completed" pour cohérence
                    render.status = response.data.status === "done" ? "completed" : response.data.status;
                  }
                  
                  // Si l'URL de la vidéo est disponible, la mettre à jour
                  if ((response.data.videoUrl || response.data.url) && !render.video_url) {
                    render.video_url = response.data.videoUrl || response.data.url;
                  }
                  
                  // Exit the retry loop on success
                  break;
                } else {
                  console.log('No data returned from check-render-status');
                  attempts++;
                  
                  // Only wait if we're going to retry
                  if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between attempts
                  }
                }
              } catch (attemptError) {
                console.error('Error in status check attempt:', attemptError);
                attempts++;
                
                // Only wait if we're going to retry
                if (attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }
            
            if (attempts === maxAttempts) {
              console.error('Max attempts reached when checking render status');
            }
          } catch (checkError) {
            console.error('Error checking render status:', checkError);
          }
        }

        return render;
      } catch (error) {
        console.error("Error in useSlideshowStatus:", error);
        return null;
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data as SlideshowRender | undefined;
      // Continuer à vérifier si le statut est pending ou processing
      if (!data || (data.status !== "completed" && data.status !== "done" && data.status !== "error")) {
        return 5000; // Vérifier toutes les 5 secondes
      }
      return false;
    },
    enabled: !!listingId,
    retry: 3,
    staleTime: 0, // Always check for fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

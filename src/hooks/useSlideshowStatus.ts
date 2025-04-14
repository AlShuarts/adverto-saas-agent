
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

        if (render && (render.status === 'pending' || render.status === 'processing')) {
          try {
            console.log("Checking render status for ID:", render.render_id);
            const response = await supabase.functions.invoke('check-render-status', {
              body: { renderId: render.render_id }
            });
            
            if (response.error) {
              console.error('Error checking render status:', response.error);
            } else {
              console.log('Render status check response:', response.data);
              
              // If status has changed, update local render
              if (response.data.status) {
                // Convert "done" to "completed" for consistency
                render.status = response.data.status === "done" ? "completed" : response.data.status;
              }
              
              // If video URL is available, update it
              if ((response.data.videoUrl || response.data.url) && !render.video_url) {
                render.video_url = response.data.videoUrl || response.data.url;
                
                // Update the database entry
                await supabase
                  .from("slideshow_renders")
                  .update({ 
                    video_url: render.video_url,
                    status: render.status,
                    updated_at: new Date().toISOString()
                  })
                  .eq("id", render.id);
              }
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
    refetchInterval: ({ state }) => {
      const data = state.data as SlideshowRender | undefined;
      // Continue checking if status is pending or processing
      if (!data || (data.status !== "completed" && data.status !== "done" && data.status !== "error")) {
        return 5000; // Check every 5 seconds
      }
      return false;
    },
    enabled: !!listingId,
  });
};

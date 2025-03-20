
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

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
              
              // Si le statut a changé, mettons à jour le render local
              if (response.data.status) {
                // Convertir "done" en "completed" pour uniformité
                render.status = response.data.status === "done" ? "completed" : response.data.status;
              }
              
              // Si une URL vidéo est disponible, mettons-la à jour
              if ((response.data.videoUrl || response.data.url) && !render.video_url) {
                render.video_url = response.data.videoUrl || response.data.url;
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
      // Continuer à vérifier si le statut est pending ou processing
      if (!data || (data.status !== "completed" && data.status !== "done" && data.status !== "error")) {
        return 10000; // Vérification toutes les 10 secondes
      }
      return false;
    },
  });
};

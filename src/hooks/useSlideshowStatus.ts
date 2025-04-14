
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

        // Si le rendu est en attente ou en cours de traitement, vérifier avec l'API Shotstack
        if (render && (render.status === 'pending' || render.status === 'processing')) {
          try {
            console.log("Checking render status for ID:", render.render_id);
            
            if (!render.render_id) {
              console.error("Missing render_id for Shotstack status check");
              return render;
            }
            
            const response = await supabase.functions.invoke('check-render-status', {
              body: { renderId: render.render_id }
            });
            
            console.log('Full check-render-status response:', response);
            
            if (response.error) {
              console.error('Error from check-render-status:', response.error);
              return render;
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
              
              // Si le rendu est terminé, actualiser les données de la base de données
              if (render.status === "completed" || render.status === "error") {
                // La mise à jour est déjà faite par la fonction check-render-status
                // Actualiser les données pour être sûr
                const { data: freshRender } = await supabase
                  .from("slideshow_renders")
                  .select("*")
                  .eq("id", render.id)
                  .single();
                  
                if (freshRender) {
                  return freshRender;
                }
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

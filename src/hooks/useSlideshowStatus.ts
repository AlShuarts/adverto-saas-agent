
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type SlideshowRender = Tables<"slideshow_renders">;

// Fonction d'aide pour mapper les statuts de l'API Shotstack vers nos statuts internes
const mapShotstackStatus = (status: string) => {
  // Mapping des statuts Shotstack vers nos statuts internes
  switch (status) {
    case "done":
    case "complete":
    case "completed":
      return "completed";
    case "failed":
    case "error":
      return "error";
    case "rendering":
    case "processing":
      return "processing";
    case "queued":
    case "pending":
      return "pending";
    default:
      return status;
  }
};

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
          throw error;
        }

        if (!renders || renders.length === 0) {
          console.log("No render found for listing ID:", listingId);
          return null;
        }
        
        const render = renders[0];
        console.log("Retrieved render status:", render);

        // Si le rendu est en attente ou en cours de traitement, vérifier avec l'API Shotstack
        if (render && (render.status === 'pending' || render.status === 'processing' || render.status === 'rendering')) {
          try {
            console.log("Checking render status for ID:", render.render_id);
            
            if (!render.render_id) {
              console.error("Missing render_id for Shotstack status check");
              return render;
            }
            
            // Récupérer la session pour l'appel authentifié
            const { data: { session } } = await supabase.auth.getSession();
            
            const response = await supabase.functions.invoke('check-render-status', {
              body: { renderId: render.render_id },
              headers: session ? {
                Authorization: `Bearer ${session.access_token}`
              } : {}
            });
            
            console.log('Full check-render-status response:', response);
            
            if (response.error) {
              console.error('Error from check-render-status:', response.error);
              return render;
            }
            
            if (response.data) {
              console.log('Render status check response data:', response.data);
              
              // Si le statut a changé, mettre à jour le rendu local immédiatement
              if (response.data.status) {
                // Map le statut de Shotstack à nos statuts internes
                const newStatus = mapShotstackStatus(response.data.status);
                
                // Si l'état a changé, mettre à jour dans la base de données
                if (newStatus !== render.status || 
                   (response.data.videoUrl && !render.video_url) || 
                   (response.data.url && !render.video_url)) {
                  
                  const updateData: any = { status: newStatus };
                  
                  // Mise à jour de l'URL vidéo si disponible
                  if ((response.data.videoUrl || response.data.url) && !render.video_url) {
                    updateData.video_url = response.data.videoUrl || response.data.url;
                  }
                  
                  console.log("Updating render in DB with:", updateData);
                  
                  try {
                    const { data: updatedRender, error: updateError } = await supabase
                      .from("slideshow_renders")
                      .update(updateData)
                      .eq("id", render.id)
                      .select('*')
                      .single();
                    
                    if (updateError) {
                      console.error("Error updating render:", updateError);
                    } else if (updatedRender) {
                      console.log("Render updated successfully:", updatedRender);
                      return updatedRender;
                    }
                  } catch (dbError) {
                    console.error("Database error while updating render:", dbError);
                  }
                }
              }
              
              // Si l'URL de la vidéo est disponible, la mettre à jour localement
              if ((response.data.videoUrl || response.data.url) && !render.video_url) {
                render.video_url = response.data.videoUrl || response.data.url;
              }
              
              // Mettre à jour le statut localement
              if (response.data.status) {
                render.status = mapShotstackStatus(response.data.status);
              }
            }
          } catch (checkError) {
            console.error('Error checking render status:', checkError);
          }
        }

        return render;
      } catch (error) {
        console.error("Error in useSlideshowStatus:", error);
        throw error;
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data as SlideshowRender | undefined;
      // Continuer à vérifier si le statut est pending ou processing ou rendering
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

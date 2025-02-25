
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type SlideshowRender = Tables<"slideshow_renders">;

export const useSlideshowStatus = (listingId: string) => {
  return useQuery<SlideshowRender>({
    queryKey: ["slideshow-status", listingId],
    queryFn: async () => {
      try {
        const { data: render, error } = await supabase
          .from("slideshow_renders")
          .select("*")
          .eq("listing_id", listingId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching render status:", error);
          toast.error("Erreur lors de la vérification du statut");
          throw error;
        }

        if (render && (render.status === 'pending' || render.status === 'processing')) {
          try {
            console.log("Checking render status for ID:", render.render_id);
            const response = await supabase.functions.invoke('check-render-status', {
              body: { renderId: render.render_id }
            });
            
            if (response.error) {
              console.error('Error checking render status:', response.error);
              throw response.error;
            }
            console.log('Render status check response:', response.data);
          } catch (checkError) {
            console.error('Error checking render status:', checkError);
            toast.error("Erreur lors de la vérification du statut de rendu");
          }
        }

        return render;
      } catch (error) {
        console.error("Error in useSlideshowStatus:", error);
        throw error;
      }
    },
    refetchInterval: ({ state }) => {
      const data = state.data as SlideshowRender | undefined;
      if (!data || data.status === "completed" || data.status === "error") {
        return false;
      }
      return 5000;
    },
  });
};

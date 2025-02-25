
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type SlideshowRender = Tables<"slideshow_renders">;

export const useSlideshowStatus = (listingId: string) => {
  return useQuery<SlideshowRender>({
    queryKey: ["slideshow-status", listingId],
    queryFn: async () => {
      const { data: render, error } = await supabase
        .from("slideshow_renders")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      
      if (render && (render.status === 'pending' || render.status === 'processing')) {
        try {
          const response = await supabase.functions.invoke('check-render-status', {
            body: { renderId: render.render_id }
          });
          
          if (response.error) throw response.error;
          console.log('Render status check response:', response.data);
        } catch (checkError) {
          console.error('Error checking render status:', checkError);
        }
      }

      return render;
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

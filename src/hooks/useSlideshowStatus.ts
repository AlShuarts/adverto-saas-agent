
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type SlideshowRender = Tables<"slideshow_renders">;

export const useSlideshowStatus = (listingId: string) => {
  return useQuery<SlideshowRender>({
    queryKey: ["slideshow-status", listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slideshow_renders")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: (state) => {
      if (!state.data || state.data.status === "completed" || state.data.status === "error") {
        return false;
      }
      return 5000;
    },
  });
};

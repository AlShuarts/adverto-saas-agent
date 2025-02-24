
import { useQuery, QueryObserverResult } from "@tanstack/react-query";
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
    refetchInterval: (queryResult: QueryObserverResult<SlideshowRender>) => {
      if (!queryResult.data || queryResult.data.status === "completed" || queryResult.data.status === "error") {
        return false;
      }
      return 5000; // Rafraîchir toutes les 5 secondes si en cours
    },
  });
};

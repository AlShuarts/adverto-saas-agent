
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useSlideshowStatus = (listingId: string) => {
  return useQuery({
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
    refetchInterval: (data) => {
      if (!data || data.status === "completed" || data.status === "error") {
        return false;
      }
      return 5000; // Rafraîchir toutes les 5 secondes si en cours
    },
  });
};


import { useEffect } from 'react';
import { Tables } from "@/integrations/supabase/types";

export const useInitialization = (
  listing: Tables<"listings">,
  resetState: () => void,
  fetchTemplates: () => void,
  fetchMusic: () => void,
) => {
  useEffect(() => {
    console.log("Initializing with new listing images...");
    resetState();
    fetchTemplates();
    fetchMusic();
  }, [listing.images, resetState, fetchTemplates, fetchMusic]);
};

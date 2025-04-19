
import { useEffect } from 'react';
import { Tables } from "@/integrations/supabase/types";

export const useInitialization = (
  listing: Tables<"listings">,
  resetState: () => void,
  fetchTemplates: () => void,
  fetchMusic: () => void,
) => {
  useEffect(() => {
    resetState();
    fetchTemplates();
    fetchMusic();
  }, [listing.images]);
};

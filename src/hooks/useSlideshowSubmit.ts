
import { useState } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

export const useSlideshowSubmit = (listing: Tables<"listings">, onClose: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (config: {
    selectedImages: string[];
    selectedMusic?: string;
  }) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      console.log("Configuration envoyée:", config);
      console.log("Musique sélectionnée:", config.selectedMusic || "aucune");
      await ensureAndIncrementStatistic('slideshow');
      
      const payload = {
        listingId: listing.id,
        config: {
          imageDuration: 3,
          showDetails: true,
          showPrice: true,
          showAddress: true,
          selectedImages: config.selectedImages,
          // S'assurer que selectedMusic est bien inclus s'il existe
          ...(config.selectedMusic && { selectedMusic: config.selectedMusic })
        }
      };
      
      console.log("Payload complet envoyé:", JSON.stringify(payload, null, 2));
      
      const response = await supabase.functions.invoke("create-slideshow", {
        body: payload
      });
      
      if (response.error) throw response.error;
      
      toast.success("Création du diaporama initiée", {
        description: "Vous serez notifié lorsque le diaporama sera prêt."
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating slideshow:", error);
      toast.error("Une erreur est survenue lors de la création du diaporama");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSubmit };
};

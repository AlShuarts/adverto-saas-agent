
import { useState } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
// Remove the ensureAndIncrementStatistic import as we'll handle this in the backend function
// import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

export const useSlideshowSubmit = (listing: Tables<"listings">, onClose: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (config: {
    selectedImages: string[];
    selectedMusic?: string;
  }) => {
    setIsLoading(true);
    
    try {
      // Vérifier et rafraîchir la session avant l'appel
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Vous devez être connecté pour générer un diaporama");
      }
      
      console.log("Session valide, token présent");
      console.log("Configuration envoyée:", config);
      console.log("Musique sélectionnée:", config.selectedMusic || "aucune");
      
      // Vérification si une musique est sélectionnée
      if (config.selectedMusic) {
        console.log("Une musique est bien sélectionnée:", config.selectedMusic);
      } else {
        console.log("Aucune musique n'est sélectionnée");
      }
      
      const payload = {
        listingId: listing.id,
        config: {
          imageDuration: 3,
          showDetails: true,
          showPrice: true,
          showAddress: true,
          selectedImages: config.selectedImages,
          // S'assurer d'envoyer explicitement la musique sélectionnée
          selectedMusic: config.selectedMusic || null
        }
      };
      
      console.log("Payload complet envoyé:", JSON.stringify(payload, null, 2));
      
      const response = await supabase.functions.invoke("create-slideshow", {
        body: payload,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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

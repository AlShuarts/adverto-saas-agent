import { Tables } from "@/integrations/supabase/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useListingText = (listing: Tables<"listings">, isOpen: boolean) => {
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateText = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-listing-description', {
          body: { listing },
        });

        if (error) throw error;
        setGeneratedText(data.text);
      } catch (err) {
        console.error('Error generating text:', err);
        setError("Impossible de générer le texte de vente. Le texte par défaut sera utilisé.");
        
        // Utilisation de l'URL complète de Centris
        const fallbackText = `${listing.title}\n\n${listing.description || ""}\n\nPlus de détails sur ${listing.centris_url || `https://www.centris.ca/fr/propriete/${listing.centris_id}`}`;
        setGeneratedText(fallbackText);
      } finally {
        setIsLoading(false);
      }
    };

    generateText();
  }, [isOpen, listing]);

  return { generatedText, isLoading, error };
};
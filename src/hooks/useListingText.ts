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
        // Construire l'URL Centris complète
        const baseUrl = "https://www.centris.ca/fr/quadruplex~a-vendre~saint-georges";
        const completeUrl = listing.centris_url || `${baseUrl}/${listing.centris_id}?view=Summary&uc=2`;

        const { data, error } = await supabase.functions.invoke('generate-listing-description', {
          body: { 
            listing: {
              ...listing,
              centris_url: completeUrl
            }
          },
        });

        if (error) throw error;
        setGeneratedText(data.text);
      } catch (err) {
        console.error('Error generating text:', err);
        setError("Impossible de générer le texte de vente. Le texte par défaut sera utilisé.");
        
        // Ensure we use the complete URL in the fallback text as well
        const baseUrl = "https://www.centris.ca/fr/quadruplex~a-vendre~saint-georges";
        const completeUrl = listing.centris_url || `${baseUrl}/${listing.centris_id}?view=Summary&uc=2`;
        const fallbackText = `${listing.title}\n\n${listing.description || ""}\n\nPlus de détails sur ${completeUrl}`;
        setGeneratedText(fallbackText);
      } finally {
        setIsLoading(false);
      }
    };

    generateText();
  }, [isOpen, listing]);

  return { generatedText, isLoading, error };
};
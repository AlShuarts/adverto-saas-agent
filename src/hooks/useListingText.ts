import { Tables } from "@/integrations/supabase/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useListingText = (listing: Tables<"listings">, isOpen: boolean) => {
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCentrisUrl = (listing: Tables<"listings">) => {
    if (listing.centris_url) {
      // Si l'URL est déjà complète, la retourner
      if (listing.centris_url.startsWith('https://www.centris.ca')) {
        return listing.centris_url;
      }
      // Si l'URL est partielle, la compléter
      return `https://www.centris.ca${listing.centris_url}`;
    }
    // URL de secours basée sur l'ID
    return `https://www.centris.ca/fr/propriete/${listing.centris_id}`;
  };

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
        
        const centrisUrl = getCentrisUrl(listing);
        const fallbackText = `${listing.title}\n\n${listing.description || ""}\n\nPlus de détails sur ${centrisUrl}`;
        setGeneratedText(fallbackText);
      } finally {
        setIsLoading(false);
      }
    };

    generateText();
  }, [isOpen, listing]);

  return { generatedText, isLoading, error };
};
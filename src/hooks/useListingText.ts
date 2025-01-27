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
        // Récupérer le template sélectionné de l'utilisateur
        const { data: templates } = await supabase
          .from('facebook_templates')
          .select('content')
          .limit(1)
          .maybeSingle();

        // Si un template existe, l'utiliser comme base pour la génération
        const { data, error } = await supabase.functions.invoke('generate-listing-description', {
          body: { 
            listing,
            template: templates?.content || undefined
          },
        });

        if (error) throw error;
        setGeneratedText(data.text);
      } catch (err) {
        console.error('Error generating text:', err);
        setError("Impossible de générer le texte de vente. Le texte par défaut sera utilisé.");
        const fallbackText = `${listing.title}\n\n${listing.description || ""}\n\nPlus de détails sur ${listing.centris_url}`;
        setGeneratedText(fallbackText);
      } finally {
        setIsLoading(false);
      }
    };

    generateText();
  }, [isOpen, listing]);

  return { generatedText, isLoading, error };
};
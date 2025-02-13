
import { Tables } from "@/integrations/supabase/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useListingText = (listing: Tables<"listings">, isOpen: boolean, selectedTemplateId?: string) => {
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateText = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Récupérer le template sélectionné
        let templateContent = null;
        if (selectedTemplateId && selectedTemplateId !== "none") {
          const { data: template } = await supabase
            .from('facebook_templates')
            .select('content')
            .eq('id', selectedTemplateId)
            .single();
          
          if (template) {
            templateContent = template.content;
          }
        }

        console.log("Template content being sent:", templateContent); // Debug log

        const { data, error } = await supabase.functions.invoke('generate-listing-description', {
          body: { 
            listing,
            selectedTemplateId,
            templateContent, // Envoyer le contenu du template directement
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
  }, [isOpen, listing, selectedTemplateId]);

  return { generatedText, isLoading, error };
};

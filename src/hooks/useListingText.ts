
import { Tables } from "@/integrations/supabase/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useListingText = (listing: Tables<"listings">, isOpen: boolean, selectedTemplateId?: string) => {
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    const generateText = async () => {
      if (!isOpen || hasGenerated) return;
      
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
        setHasGenerated(true);
        
        // Increment the usage statistics for description generation
        const { error: statError } = await supabase.rpc(
          'increment_usage_statistic',
          {
            user_id_param: (await supabase.auth.getUser()).data.user?.id,
            statistic_type: 'description'
          }
        );

        if (statError) {
          console.error("Erreur lors de la mise à jour des statistiques:", statError);
        }
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
  }, [isOpen, listing, selectedTemplateId, hasGenerated]);

  return { generatedText, isLoading, error };
};

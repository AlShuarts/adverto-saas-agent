
import { Tables } from "@/integrations/supabase/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useListingText = (listing: Tables<"listings">, isOpen: boolean, selectedTemplateId?: string) => {
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Fonction pour s'assurer que l'entrée de statistiques existe pour l'utilisateur
  const ensureStatisticsEntry = async (userId: string) => {
    try {
      // Vérifier si une entrée existe déjà
      const { data, error } = await supabase
        .from('usage_statistics')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Erreur lors de la vérification des statistiques:", error);
        return false;
      }
      
      // Si aucune entrée n'existe, en créer une nouvelle
      if (!data) {
        const { error: insertError } = await supabase
          .from('usage_statistics')
          .insert([{ user_id: userId }]);
        
        if (insertError) {
          console.error("Erreur lors de la création de l'entrée statistique:", insertError);
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error("Exception lors de la vérification/création des statistiques:", err);
      return false;
    }
  };

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
            .maybeSingle();
          
          if (template) {
            templateContent = template.content;
          }
        }

        console.log("Template content being sent:", templateContent); // Debug log

        const { data, error } = await supabase.functions.invoke('generate-listing-description', {
          body: { 
            listing,
            templateContent, 
          },
        });

        if (error) throw error;
        setGeneratedText(data.text);
        setHasGenerated(true);
        
        // Récupérer l'ID utilisateur
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // S'assurer qu'une entrée de statistiques existe pour cet utilisateur
          const success = await ensureStatisticsEntry(user.id);
          
          if (success) {
            // Incrémenter les statistiques d'utilisation pour la génération de description
            const { error: statError } = await supabase.rpc(
              'increment_usage_statistic',
              {
                user_id_param: user.id,
                statistic_type: 'description'
              }
            );

            if (statError) {
              console.error("Erreur lors de la mise à jour des statistiques:", statError);
            }
          }
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

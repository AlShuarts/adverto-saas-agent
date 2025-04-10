
import { supabase } from "@/integrations/supabase/client";

/**
 * S'assure qu'une entrée de statistiques existe pour l'utilisateur avant d'incrémenter
 */
export const ensureAndIncrementStatistic = async (statisticType: 'description' | 'slideshow' | 'facebook' | 'instagram') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("Aucun utilisateur connecté");
      return false;
    }

    // Vérifier si une entrée existe déjà
    const { data, error } = await supabase
      .from('usage_statistics')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Erreur lors de la vérification des statistiques:", error);
      return false;
    }
    
    // Si aucune entrée n'existe, en créer une nouvelle
    if (!data) {
      const { error: insertError } = await supabase
        .from('usage_statistics')
        .insert([{ user_id: user.id }]);
      
      if (insertError) {
        console.error("Erreur lors de la création de l'entrée statistique:", insertError);
        return false;
      }
    }
    
    // Incrémenter la statistique
    const { error: statError } = await supabase.rpc(
      'increment_usage_statistic',
      {
        user_id_param: user.id,
        statistic_type: statisticType
      }
    );

    if (statError) {
      console.error(`Erreur lors de la mise à jour de la statistique ${statisticType}:`, statError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Exception lors de l'incrémentation des statistiques:", err);
    return false;
  }
};

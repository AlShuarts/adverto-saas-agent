
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * S'assure qu'une entrée de statistiques existe pour l'utilisateur et incrémente
 * le compteur correspondant à l'activité spécifiée
 */
export const ensureAndIncrementStatistic = async (statisticType: 'description' | 'slideshow' | 'facebook' | 'instagram') => {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Erreur d'authentification:", authError);
      return false;
    }
    
    if (!user) {
      console.error("Aucun utilisateur connecté");
      return false;
    }

    console.log(`Tentative d'incrémentation des statistiques (${statisticType}) pour l'utilisateur ${user.id}`);
    
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
      console.log("Aucune entrée statistique trouvée, création d'une nouvelle entrée");
      const { error: insertError } = await supabase
        .from('usage_statistics')
        .insert([{ user_id: user.id }]);
      
      if (insertError) {
        console.error("Erreur lors de la création de l'entrée statistique:", insertError);
        toast.error("Impossible de mettre à jour les statistiques d'utilisation");
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
    
    console.log(`Statistique ${statisticType} incrémentée avec succès`);
    return true;
  } catch (err) {
    console.error("Exception lors de l'incrémentation des statistiques:", err);
    return false;
  }
};

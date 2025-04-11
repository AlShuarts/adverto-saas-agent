
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * S'assure qu'une entrée de statistiques existe pour l'utilisateur et incrémente
 * le compteur correspondant à l'activité spécifiée
 */
export const ensureAndIncrementStatistic = async (statisticType: 'description' | 'slideshow' | 'facebook' | 'instagram' | 'banner') => {
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
    
    // Vérifier si une entrée existe déjà et la créer si nécessaire
    const { data: existingStat, error: checkError } = await supabase
      .from('usage_statistics')
      .select(`id, ${statisticType}_generations`)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error("Erreur lors de la vérification des statistiques:", checkError);
      return false;
    }
    
    // Si aucune entrée n'existe, en créer une nouvelle
    if (!existingStat) {
      console.log("Création d'une nouvelle entrée statistique...");
      const initialValues = {
        user_id: user.id,
        description_generations: 0,
        slideshow_generations: 0,
        facebook_generations: 0,
        instagram_generations: 0,
        banner_generations: 0
      };
      
      // Incrémenter le compteur demandé
      initialValues[`${statisticType}_generations`] = 1;
      
      const { error: insertError } = await supabase
        .from('usage_statistics')
        .insert([initialValues]);
      
      if (insertError) {
        console.error("Erreur lors de la création de l'entrée statistique:", insertError);
        toast.error("Impossible de créer les statistiques d'utilisation");
        return false;
      }
      console.log("Nouvelle entrée statistique créée avec succès avec compteur initialisé à 1");
    } else {
      console.log("Entrée statistique existante trouvée, incrémentation du compteur");
      
      // Récupérer la valeur actuelle
      const currentValue = existingStat[`${statisticType}_generations`] || 0;
      const newValue = currentValue + 1;
      
      // Créer un objet pour la mise à jour
      const updateObj: Record<string, number> = {};
      updateObj[`${statisticType}_generations`] = newValue;
      
      // Mettre à jour le compteur
      const { error: updateError } = await supabase
        .from('usage_statistics')
        .update(updateObj)
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error(`Erreur lors de la mise à jour du compteur ${statisticType}:`, updateError);
        toast.error(`Impossible de mettre à jour les statistiques de ${statisticType}`);
        return false;
      }
      
      console.log(`Compteur ${statisticType} incrémenté de ${currentValue} à ${newValue}`);
    }
    
    return true;
  } catch (err) {
    console.error("Exception lors de l'incrémentation des statistiques:", err);
    return false;
  }
};

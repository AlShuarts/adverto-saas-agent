
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
    
    // Vérifier si une entrée existe déjà et la créer si nécessaire
    const { data: existingStat, error: checkError } = await supabase
      .from('usage_statistics')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error("Erreur lors de la vérification des statistiques:", checkError);
      return false;
    }
    
    // Si aucune entrée n'existe, en créer une nouvelle
    if (!existingStat) {
      console.log("Création d'une nouvelle entrée statistique...");
      const { error: insertError } = await supabase
        .from('usage_statistics')
        .insert([{ 
          user_id: user.id,
          description_generations: 0,
          slideshow_generations: 0,
          facebook_generations: 0,
          instagram_generations: 0
        }]);
      
      if (insertError) {
        console.error("Erreur lors de la création de l'entrée statistique:", insertError);
        toast.error("Impossible de créer les statistiques d'utilisation");
        return false;
      }
      console.log("Nouvelle entrée statistique créée avec succès");
    } else {
      console.log("Entrée statistique existante trouvée");
    }
    
    // Mettre à jour directement le compteur spécifique
    const updateData: Record<string, number> = {};
    updateData[`${statisticType}_generations`] = supabase.rpc('increment_counter');
    
    console.log(`Mise à jour du compteur ${statisticType}_generations...`, updateData);
    
    const { error: updateError } = await supabase
      .from('usage_statistics')
      .update({ [`${statisticType}_generations`]: supabase.sql`${statisticType}_generations + 1` })
      .eq('user_id', user.id);

    if (updateError) {
      console.error(`Erreur lors de la mise à jour du compteur ${statisticType}:`, updateError);
      toast.error(`Impossible de mettre à jour les statistiques de ${statisticType}`);
      return false;
    }
    
    console.log(`Statistique ${statisticType} incrémentée avec succès`);
    return true;
  } catch (err) {
    console.error("Exception lors de l'incrémentation des statistiques:", err);
    return false;
  }
};


import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export const updateUsageStatistics = async (supabase: SupabaseClient, userId: string) => {
  // Comment out this entire function to prevent the backend increment
  // This ensures only the frontend increment from useSlideshowGeneration.ts is used
  return;
  
  /*
  try {
    const { data: existingStat, error: fetchError } = await supabase
      .from('usage_statistics')
      .select('id, slideshow_generations')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error("⚠️ Erreur lors de la vérification des statistiques:", fetchError);
      return;
    }

    if (!existingStat) {
      const { error: insertError } = await supabase
        .from('usage_statistics')
        .insert([{ 
          user_id: userId, 
          description_generations: 0, 
          slideshow_generations: 1, 
          facebook_generations: 0, 
          instagram_generations: 0 
        }]);
      
      if (insertError) {
        console.error("⚠️ Erreur lors de la création des statistiques:", insertError);
      } else {
        console.log("✅ Nouvelle entrée statistique créée avec succès");
      }
    } else {
      const currentValue = existingStat.slideshow_generations || 0;
      const { error: updateError } = await supabase
        .from('usage_statistics')
        .update({ slideshow_generations: currentValue + 1 })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error("⚠️ Erreur lors de la mise à jour des statistiques:", updateError);
      } else {
        console.log(`✅ Compteur slideshow incrémenté de ${currentValue} à ${currentValue + 1}`);
      }
    }
  } catch (statErr) {
    console.error("⚠️ Exception lors de la mise à jour des statistiques:", statErr);
  }
  */
};

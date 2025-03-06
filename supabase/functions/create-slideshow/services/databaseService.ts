
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export const getListingById = async (supabase: any, listingId: string) => {
  console.log("📡 Récupération des données du listing.");
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    console.error("❌ Erreur lors de la récupération du listing:", listingError);
    throw new Error("Listing non trouvé.");
  }
  
  return listing;
};

export const saveRenderRecord = async (supabase: any, data: any) => {
  console.log("💾 Création d'un enregistrement pour le rendu:", data.renderId);
  const { error: insertError } = await supabase
    .from("slideshow_renders")
    .insert({
      listing_id: data.listingId,
      render_id: data.renderId,
      status: "pending",
      user_id: data.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (insertError) {
    console.error("❌ Erreur lors de l'enregistrement du rendu:", insertError);
    throw new Error(`Erreur lors de l'enregistrement du rendu: ${insertError.message}`);
  }
};


import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/utils/priceFormatter";

interface CentrisData {
  centris_id: string;
  title: string;
  description?: string;
  price?: any;
  address?: string;
  city?: string;
  postal_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  images?: string[];
}

export const importCentrisListing = async (url: string, userId: string) => {
  console.log("Appel de la fonction scrape-centris avec l'URL:", url);
  const { data: response, error: functionError } = await supabase.functions.invoke('scrape-centris', {
    body: { url }
  });

  if (functionError) {
    console.error("Erreur de la fonction scrape-centris:", functionError);
    throw new Error("Erreur lors du scraping: " + functionError.message);
  }

  if (!response) {
    throw new Error("Aucune donnée reçue du scraping");
  }

  console.log("Données reçues du scraping:", response);

  // Validation des données
  if (!response.centris_id) {
    throw new Error("L'ID Centris est manquant dans les données scrappées");
  }

  // Formater le prix
  const formattedPrice = response.price ? formatPrice(response.price) : null;
  console.log("Prix formaté:", response.price, "->", formattedPrice);

  // Données à insérer avec des valeurs par défaut sensibles pour les champs optionnels
  const listingData = {
    centris_id: response.centris_id,
    centris_url: url,
    title: response.title || "Propriété à vendre",
    description: response.description || null,
    price: response.price || null,
    address: response.address || null,
    city: response.city || null,
    postal_code: response.postal_code || null,
    bedrooms: typeof response.bedrooms === 'number' ? response.bedrooms : null,
    bathrooms: typeof response.bathrooms === 'number' ? response.bathrooms : null,
    property_type: response.property_type || "Résidentiel",
    images: Array.isArray(response.images) && response.images.length > 0 ? response.images : null,
    user_id: userId,
  };

  console.log("Données formatées pour l'insertion:", listingData);

  // Vérification si le listing existe déjà
  const { data: existingListing } = await supabase
    .from("listings")
    .select("id")
    .eq("centris_id", response.centris_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingListing) {
    console.log("Listing existant trouvé, mise à jour...");
    const { error: updateError } = await supabase
      .from("listings")
      .update(listingData)
      .eq("id", existingListing.id);

    if (updateError) {
      console.error("Erreur lors de la mise à jour du listing:", updateError);
      throw new Error("Erreur lors de la mise à jour: " + updateError.message);
    }

    // Récupérer le listing mis à jour
    const { data: updatedListing, error: fetchError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", existingListing.id)
      .single();

    if (fetchError) {
      console.error("Erreur lors de la récupération du listing mis à jour:", fetchError);
      throw new Error("Erreur lors de la récupération du listing mis à jour: " + fetchError.message);
    }

    return updatedListing;
  } else {
    console.log("Nouveau listing, insertion...");
    const { data: newListing, error: insertError } = await supabase
      .from("listings")
      .insert(listingData)
      .select("*")
      .single();

    if (insertError) {
      console.error("Erreur d'insertion dans la base de données:", insertError);
      throw new Error("Erreur lors de l'enregistrement: " + insertError.message);
    }

    return newListing;
  }
};

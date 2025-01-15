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

  const formattedPrice = formatPrice(response.price);
  console.log("Prix formaté:", response.price, "->", formattedPrice);

  const listingData = {
    centris_id: response.centris_id,
    centris_url: url, // Ajout de l'URL Centris
    title: response.title,
    description: response.description || null,
    price: formattedPrice,
    address: response.address || null,
    city: response.city || null,
    postal_code: response.postal_code || null,
    bedrooms: response.bedrooms || null,
    bathrooms: response.bathrooms || null,
    property_type: response.property_type || null,
    images: response.images || null,
    user_id: userId,
  };

  console.log("Données formatées pour l'insertion:", listingData);

  const { error: insertError } = await supabase
    .from("listings")
    .insert(listingData);

  if (insertError) {
    console.error("Erreur d'insertion dans la base de données:", insertError);
    throw new Error("Erreur lors de l'enregistrement: " + insertError.message);
  }

  return listingData;
};
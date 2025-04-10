
import { formatPrice } from "./formatter.ts";

export const prepareTextElements = (listing: any, config: any) => {
  const textElements = [];
  
  // Adresse (toujours affichée)
  if (listing.address) {
    // Utiliser uniquement le champ adresse sans ajouter la ville ou le code postal
    textElements.push(listing.address);
  }

  // Prix (toujours affiché)
  if (listing.price) {
    const formattedPrice = formatPrice(listing.price);
    console.log(`Prix formaté: ${formattedPrice} depuis ${listing.price}`);
    textElements.push(formattedPrice);
  }
  
  // Chambres et salles de bain (toujours affichées)
  const details = [];
  if (listing.bedrooms) details.push(`${listing.bedrooms} ch.`);
  if (listing.bathrooms) details.push(`${listing.bathrooms} sdb.`);
  if (details.length > 0) {
    textElements.push(details.join(" | "));
  }
  
  console.log(`Éléments de texte préparés: ${JSON.stringify(textElements)}`);
  return textElements;
};

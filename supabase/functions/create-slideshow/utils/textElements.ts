
import { formatPrice } from "./formatter.ts";

export const prepareTextElements = (listing: any, config: any) => {
  // On ne génère qu'un seul élément de texte qui contient toutes les informations
  const textInfos = [];
  
  if (config.showDetails) {
    // Prix si disponible et activé
    if (config.showPrice && listing.price) {
      textInfos.push(formatPrice(listing.price));
    }
    
    // Adresse si disponible et activée
    if (config.showAddress && listing.address) {
      let address = listing.address;
      if (listing.city) {
        address += `, ${listing.city}`;
      }
      if (listing.postal_code) {
        address += ` ${listing.postal_code}`;
      }
      textInfos.push(address);
    }
    
    // Informations sur les chambres et salles de bain
    const details = [];
    if (listing.bedrooms) details.push(`${listing.bedrooms} ch.`);
    if (listing.bathrooms) details.push(`${listing.bathrooms} sdb.`);
    
    if (details.length > 0) {
      textInfos.push(details.join(" | "));
    }
  }
  
  // Retourne un tableau avec un seul élément qui contient toutes les infos
  return textInfos.length > 0 ? [textInfos.join("\n")] : [];
};

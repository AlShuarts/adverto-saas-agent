
import { formatPrice } from "./formatter.ts";

export const prepareTextElements = (listing: any, config: any) => {
  const textElements = [];
  
  if (config.showDetails) {
    // Prix si disponible et activé
    if (config.showPrice && listing.price) {
      textElements.push(formatPrice(listing.price));
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
      textElements.push(address);
    }
    
    // Informations sur les chambres et salles de bain
    const details = [];
    if (listing.bedrooms) details.push(`${listing.bedrooms} ch.`);
    if (listing.bathrooms) details.push(`${listing.bathrooms} sdb.`);
    
    if (details.length > 0) {
      textElements.push(details.join(" | "));
    }
  }
  
  return textElements;
};

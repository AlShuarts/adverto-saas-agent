
import { formatPrice } from "./formatter.ts";

export const prepareTextElements = (listing: any, config: any) => {
  const textElements = [];
  
  if (config.showDetails) {
    // Adresse en premier si disponible et activée
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

    // Prix en deuxième si disponible et activé
    if (config.showPrice && listing.price) {
      textElements.push(formatPrice(listing.price));
    }
    
    // Chambres et salles de bain en dernier
    const details = [];
    if (listing.bedrooms) details.push(`${listing.bedrooms} ch.`);
    if (listing.bathrooms) details.push(`${listing.bathrooms} sdb.`);
    if (details.length > 0) {
      textElements.push(details.join(" | "));
    }
  }
  
  return textElements;
};



import { formatPrice } from "./formatter.ts";

export const prepareTextElements = (listing: any, config: any) => {
  const textElements = [];
  
  // Address (only if enabled)
  if (config.showAddress && listing.address) {
    // Only use the address field without appending city or postal code
    textElements.push(listing.address);
  }

  // Price (only if enabled)
  if (config.showPrice && listing.price) {
    const formattedPrice = formatPrice(listing.price);
    console.log(`Prix formaté: ${formattedPrice} depuis ${listing.price}`);
    textElements.push(formattedPrice);
  }
  
  // Bedrooms and bathrooms (only if enabled)
  if (config.showDetails) {
    const details = [];
    if (listing.bedrooms) details.push(`${listing.bedrooms} ch.`);
    if (listing.bathrooms) details.push(`${listing.bathrooms} sdb.`);
    if (details.length > 0) {
      textElements.push(details.join(" | "));
    }
  }
  
  console.log(`Éléments de texte préparés: ${JSON.stringify(textElements)}`);
  return textElements;
};

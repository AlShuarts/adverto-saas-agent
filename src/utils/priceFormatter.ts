export const formatPrice = (price: any): number | null => {
  if (!price) return null;
  try {
    const cleanPrice = String(price).replace(/[\s$,]/g, '');
    const numericPrice = parseFloat(cleanPrice);
    
    if (isNaN(numericPrice) || numericPrice > 9999999999.99 || numericPrice < -9999999999.99) {
      console.log("Prix invalide ou hors limites:", price, "->", numericPrice);
      return null;
    }
    return numericPrice;
  } catch (error) {
    console.error("Erreur lors du formatage du prix:", error);
    return null;
  }
};
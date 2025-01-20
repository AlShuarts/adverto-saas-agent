export const imageSelectors = [
  // Sélecteurs principaux pour les images
  'img[src*="mspublic.centris.ca/media.ashx"]',
  'img[data-src*="mspublic.centris.ca/media.ashx"]',
  
  // Conteneurs d'images spécifiques
  '#divMainPhoto img',
  '.MainImg img',
  '.photo-gallery img',
  '.Carousel img',
  
  // Attributs spécifiques
  'img[itemprop="image"]',
  'img[data-qaid="property-photo"]'
];
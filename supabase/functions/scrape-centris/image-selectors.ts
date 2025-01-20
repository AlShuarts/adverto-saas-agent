export const imageSelectors = [
  // Sélecteurs pour les images haute qualité
  'img[src*="mspublic.centris.ca/media.ashx"][data-high-res]',
  'img[data-src*="mspublic.centris.ca/media.ashx"][data-high-res]',
  '[data-image-url*="mspublic.centris.ca/media.ashx"][data-high-res]',
  
  // Sélecteurs de base pour les images Centris
  'img[src*="mspublic.centris.ca/media.ashx"]',
  'img[data-src*="mspublic.centris.ca/media.ashx"]',
  '[data-image-url*="mspublic.centris.ca/media.ashx"]',
  '[data-original*="mspublic.centris.ca/media.ashx"]',
  
  // Conteneurs d'images spécifiques
  '#divMainPhoto img',
  '.MainImg img',
  '.photo-gallery img[data-high-res]',
  '.Carousel img[data-high-res]',
  
  // Attributs spécifiques pour les images haute qualité
  'img[itemprop="image"][data-high-res]',
  'img[data-qaid="property-photo"][data-high-res]'
];
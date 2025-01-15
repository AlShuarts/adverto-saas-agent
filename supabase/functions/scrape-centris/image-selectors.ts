export const imageSelectors = [
  // Sélecteurs spécifiques pour les images Centris
  'img[src*="mspublic.centris.ca/media.ashx"]',
  'img[data-src*="mspublic.centris.ca/media.ashx"]',
  '[data-image-url*="mspublic.centris.ca/media.ashx"]',
  '[data-original*="mspublic.centris.ca/media.ashx"]',
  
  // Conteneurs d'images
  '#divMainPhoto img',
  '#divPhotos img',
  '.photo-gallery img',
  '.MainImg img',
  '.Carousel img',
  '.Gallery img',
  
  // Attributs spécifiques
  'img[itemprop="image"]',
  'img[data-qaid="property-photo"]',
  '[data-qaid="photos"] img'
];
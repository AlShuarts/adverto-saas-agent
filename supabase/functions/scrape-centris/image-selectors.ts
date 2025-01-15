export const imageSelectors = [
  // Images principales
  '.MainImg img',
  '#imgBig',
  '.imgBig',
  
  // Galerie et carousel
  '.Gallery img',
  '.Carousel img',
  '[data-qaid="photos"] img',
  '#visite360 img',
  '.ModalImg img',
  
  // Sélecteurs spécifiques Centris
  'img[data-src*="s3.amazonaws.com/media.centris.ca"]',
  'img[src*="s3.amazonaws.com/media.centris.ca"]',
  'img[data-src*="centris.ca/media"]',
  'img[src*="centris.ca/media"]',
  'img[src*="centris"]',
  'img[data-src*="centris"]',
  
  // Sélecteurs de classe
  '.property-photos img',
  '.listing-photos img',
  '.centris-photos img',
  
  // Attributs spécifiques
  'img[itemprop="image"]',
  'img[data-qaid="property-photo"]'
];
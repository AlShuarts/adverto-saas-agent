export const imageSelectors = [
  // Sélecteurs spécifiques à Centris
  'img[data-src*="centris.ca"]',
  'img[src*="centris.ca"]',
  'img[data-original*="centris.ca"]',
  '.MainImg img',
  '#divMainPhoto img',
  '.photo-gallery img',
  '.carouselbox img',
  '.carousel-item img',
  '.property-thumbnail img',
  '.property-image img',
  '.listing-image img',
  // Sélecteur générique pour toutes les images Centris
  'img[src*="mspublic.centris.ca/media.ashx"]',
  'img[data-src*="mspublic.centris.ca/media.ashx"]',
  'img[srcset*="mspublic.centris.ca/media.ashx"]'
];
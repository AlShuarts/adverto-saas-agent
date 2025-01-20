export const imageSelectors = [
  // Sélecteurs principaux pour Centris
  'img[data-src*="centris.ca"]',
  'img[src*="centris.ca"]',
  'img[data-original*="centris.ca"]',
  // Sélecteurs spécifiques pour les médias Centris
  'img[src*="mspublic.centris.ca"]',
  'img[data-src*="mspublic.centris.ca"]',
  'img[srcset*="mspublic.centris.ca"]',
  // Sélecteurs pour la gallerie d'images
  '.MainImg img',
  '.MainPhoto img',
  '.PropertyPhoto img',
  '.PropertyGallery img',
  '.ImageGallery img',
  '.Slideshow img',
  '.carouselbox img',
  '.carousel-item img',
  // Sélecteurs pour les vignettes
  '.Thumbnail img',
  '.ThumbPhoto img',
  '.GalleryThumbnail img',
  // Nouveaux sélecteurs spécifiques à Centris
  '.property-thumbnail-container img',
  '.property-thumbnail img',
  '.property-image img',
  '.listing-image img',
  // Sélecteur générique pour attraper les images restantes
  'img[src*="media.ashx"]'
];
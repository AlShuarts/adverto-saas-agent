export const listingSelectors = {
  title: [
    'h1.text-center',
    'h1.listing-title',
    'h1[itemprop="name"]',
    '.property-title h1',
    '.listing-title',
    '[data-qaid="property-title"]',
    '[data-qaid="property-description-title"]',
    '.property-title',
    '.description-title',
    'h1'
  ],
  price: [
    '.listing-price',
    '.property-price',
    '[data-qaid="property-price"]',
    '[data-qaid="price"]',
    '.property-price',
    '.price',
    'span[itemprop="price"]',
    '.price-container'
  ],
  description: [
    '.description-text',
    '.listing-description',
    '[data-qaid="property-description"]',
    '[data-qaid="description"]',
    '.property-description',
    '.description',
    '[itemprop="description"]'
  ],
  address: [
    '.listing-address',
    '.property-address',
    '[data-qaid="property-address"]',
    '[data-qaid="address"]',
    '.property-address',
    '.address',
    '[itemprop="streetAddress"]'
  ],
  city: [
    '.listing-city',
    '.property-city',
    '[data-qaid="property-city"]',
    '[data-qaid="city"]',
    '.property-city',
    '.city',
    '[itemprop="addressLocality"]'
  ],
  bedrooms: [
    '.listing-bedrooms',
    '.property-bedrooms',
    '[data-qaid="property-bedrooms"]',
    '[data-qaid="bedrooms"]',
    '.property-bedrooms',
    '.bedrooms',
    '[itemprop="numberOfRooms"]'
  ],
  bathrooms: [
    '.listing-bathrooms',
    '.property-bathrooms',
    '[data-qaid="property-bathrooms"]',
    '[data-qaid="bathrooms"]',
    '.property-bathrooms',
    '.bathrooms'
  ]
};
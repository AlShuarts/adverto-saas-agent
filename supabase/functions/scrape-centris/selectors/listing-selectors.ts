
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
    '.price-container',
    'span.d-block.text-nowrap'
  ],
  description: [
    '.description-text',
    '.listing-description',
    '[data-qaid="property-description"]',
    '[data-qaid="description"]',
    '.property-description',
    '.description',
    '[itemprop="description"]',
    'div.cac-featured div.teaser'
  ],
  address: [
    '.listing-address',
    '.property-address',
    '[data-qaid="property-address"]',
    '[data-qaid="address"]',
    '.property-address',
    '.address',
    '[itemprop="streetAddress"]',
    'span[data-id="PageTitle"]',
    'div.address'
  ],
  city: [
    '.listing-city',
    '.property-city',
    '[data-qaid="property-city"]',
    '[data-qaid="city"]',
    '.property-city',
    '.city',
    '[itemprop="addressLocality"]',
    '.city-name',
    'div.address span.city'
  ],
  bedrooms: [
    '.listing-bedrooms',
    '.property-bedrooms',
    '[data-qaid="property-bedrooms"]',
    '[data-qaid="bedrooms"]',
    '.property-bedrooms',
    '.bedrooms',
    '[itemprop="numberOfRooms"]',
    'div.cac',
    'div.tetiere span.cac'
  ],
  bathrooms: [
    '.listing-bathrooms',
    '.property-bathrooms',
    '[data-qaid="property-bathrooms"]',
    '[data-qaid="bathrooms"]',
    '.property-bathrooms',
    '.bathrooms',
    'div.sdb',
    'div.tetiere span.sdb'
  ],
  postal_code: [
    '.postal-code',
    '[itemprop="postalCode"]',
    '.property-postal-code',
    '[data-qaid="property-postal-code"]',
    'div.address span.postal-code'
  ],
  property_type: [
    '.property-type',
    '[data-qaid="property-type"]',
    '[itemprop="propertyType"]',
    '.tetiere span.category',
    'div.category'
  ],
  features: [
    '.property-features',
    '.features',
    '[data-qaid="property-features"]',
    '.property-characteristics',
    'ul.characteristics'
  ]
};

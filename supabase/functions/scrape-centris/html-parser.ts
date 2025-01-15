import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { ListingData } from './types.ts';
import { imageSelectors } from './image-selectors.ts';

export class HtmlParser {
  private doc: any;

  constructor(html: string) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(html, "text/html");
    if (!this.doc) {
      throw new Error("Failed to parse HTML");
    }
    console.log('HTML parsed successfully');
  }

  private getTextFromSelectors(selectors: string[]): string {
    for (const selector of selectors) {
      const element = this.doc.querySelector(selector);
      if (!element) continue;
      
      const text = element.textContent?.trim();
      if (text) {
        console.log(`Found text with selector ${selector}:`, text);
        return text;
      }
    }
    return "";
  }

  private extractNumber(text: string): number | null {
    const match = text.replace(/\s/g, '').match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  private cleanPrice(text: string): number | null {
    const numStr = text.replace(/[^0-9]/g, '');
    return numStr ? parseInt(numStr) : null;
  }

  private isValidImageUrl(url: string): boolean {
    if (!url) return false;

    // Vérifier si c'est une URL Centris valide
    const isCentrisUrl = url.includes('centris.ca') || 
                        url.includes('s3.amazonaws.com/media.centris.ca');
    
    // Vérifier si c'est une image (extension)
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
    
    // Exclure les miniatures
    const isNotThumbnail = !url.includes('thumbnail') && 
                          !url.includes('small') && 
                          !url.includes('icon');

    return isCentrisUrl && hasImageExtension && isNotThumbnail;
  }

  getImageUrls(): string[] {
    console.log('Starting to extract image URLs');
    
    const imageUrls: string[] = [];
    const seenUrls = new Set<string>();

    // Log the entire HTML for debugging
    console.log('Full HTML document:', this.doc.documentElement.outerHTML);

    for (const selector of imageSelectors) {
      console.log('Trying selector:', selector);
      const elements = this.doc.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements with selector ${selector}`);
      
      for (const img of elements) {
        const src = img.getAttribute("src");
        const dataSrc = img.getAttribute("data-src");
        const srcset = img.getAttribute("srcset");
        
        console.log('Found image attributes:', { src, dataSrc, srcset });
        
        [src, dataSrc].forEach(url => {
          if (url && !seenUrls.has(url) && this.isValidImageUrl(url)) {
            console.log('Adding new image URL:', url);
            seenUrls.add(url);
            imageUrls.push(url);
          }
        });

        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          srcsetUrls.forEach(url => {
            if (!seenUrls.has(url) && this.isValidImageUrl(url)) {
              console.log('Adding srcset URL:', url);
              seenUrls.add(url);
              imageUrls.push(url);
            }
          });
        }
      }
    }

    console.log('Total unique images found:', imageUrls.length);
    return imageUrls;
  }

  parseListing(centrisId: string): Omit<ListingData, 'images'> {
    const titleSelectors = [
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
    ];

    const priceSelectors = [
      '.listing-price',
      '.property-price',
      '[data-qaid="property-price"]',
      '[data-qaid="price"]',
      '.property-price',
      '.price',
      'span[itemprop="price"]',
      '.price-container'
    ];

    const descriptionSelectors = [
      '.description-text',
      '.listing-description',
      '[data-qaid="property-description"]',
      '[data-qaid="description"]',
      '.property-description',
      '.description',
      '[itemprop="description"]'
    ];

    const addressSelectors = [
      '.listing-address',
      '.property-address',
      '[data-qaid="property-address"]',
      '[data-qaid="address"]',
      '.property-address',
      '.address',
      '[itemprop="streetAddress"]'
    ];

    const citySelectors = [
      '.listing-city',
      '.property-city',
      '[data-qaid="property-city"]',
      '[data-qaid="city"]',
      '.property-city',
      '.city',
      '[itemprop="addressLocality"]'
    ];

    const bedroomSelectors = [
      '.listing-bedrooms',
      '.property-bedrooms',
      '[data-qaid="property-bedrooms"]',
      '[data-qaid="bedrooms"]',
      '.property-bedrooms',
      '.bedrooms',
      '[itemprop="numberOfRooms"]'
    ];

    const bathroomSelectors = [
      '.listing-bathrooms',
      '.property-bathrooms',
      '[data-qaid="property-bathrooms"]',
      '[data-qaid="bathrooms"]',
      '.property-bathrooms',
      '.bathrooms'
    ];

    const title = this.getTextFromSelectors(titleSelectors);
    const priceText = this.getTextFromSelectors(priceSelectors);
    const description = this.getTextFromSelectors(descriptionSelectors);
    const address = this.getTextFromSelectors(addressSelectors);
    const city = this.getTextFromSelectors(citySelectors);
    const bedroomsText = this.getTextFromSelectors(bedroomSelectors);
    const bathroomsText = this.getTextFromSelectors(bathroomSelectors);

    return {
      centris_id: centrisId,
      title: title || "Propriété à vendre",
      description: description || null,
      price: priceText ? this.cleanPrice(priceText) : null,
      address: address || null,
      city: city || null,
      postal_code: null,
      bedrooms: bedroomsText ? this.extractNumber(bedroomsText) : null,
      bathrooms: bathroomsText ? this.extractNumber(bathroomsText) : null,
      property_type: "Résidentiel"
    };
  }
}
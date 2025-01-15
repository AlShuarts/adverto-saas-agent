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

    // Vérifier si c'est une URL Centris valide avec le bon domaine
    const isCentrisUrl = url.includes('mspublic.centris.ca/media.ashx');
    
    // Vérifier les paramètres attendus
    const hasRequiredParams = url.includes('id=') && 
                            (url.includes('&t=pi') || url.includes('&t=photo'));
    
    return isCentrisUrl && hasRequiredParams;
  }

  private cleanImageUrl(url: string): string {
    // Assurer que l'URL a les bons paramètres de taille
    if (!url.includes('&w=') && !url.includes('&h=')) {
      url += '&w=640&h=480&sm=c';
    }
    return url;
  }

  getImageUrls(): string[] {
    console.log('Starting to extract image URLs');
    
    const imageUrls: string[] = [];
    const seenUrls = new Set<string>();

    // Chercher spécifiquement les URLs d'images Centris
    const scripts = this.doc.getElementsByTagName('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      const matches = content.match(/https:\/\/mspublic\.centris\.ca\/media\.ashx\?[^"'\s]+/g);
      if (matches) {
        matches.forEach(url => {
          if (this.isValidImageUrl(url) && !seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Found image URL in script:', cleanedUrl);
          }
        });
      }
    }

    // Chercher aussi dans les balises img et les attributs data-*
    for (const selector of imageSelectors) {
      const elements = this.doc.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements with selector ${selector}`);
      
      for (const img of elements) {
        const src = img.getAttribute("src");
        const dataSrc = img.getAttribute("data-src");
        const srcset = img.getAttribute("srcset");
        
        [src, dataSrc].forEach(url => {
          if (url && this.isValidImageUrl(url) && !seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Found image URL in img tag:', cleanedUrl);
          }
        });

        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          srcsetUrls.forEach(url => {
            if (this.isValidImageUrl(url) && !seenUrls.has(url)) {
              const cleanedUrl = this.cleanImageUrl(url);
              seenUrls.add(cleanedUrl);
              imageUrls.push(cleanedUrl);
              console.log('Found image URL in srcset:', cleanedUrl);
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
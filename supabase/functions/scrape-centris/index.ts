import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('Scraping URL:', url);

    if (!url.includes("centris.ca")) {
      return new Response(
        JSON.stringify({ error: "URL must be from centris.ca" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const html = await response.text();
    console.log('HTML content length:', html.length);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Helper function to try multiple selectors and clean text
    const getTextFromSelectors = (selectors: string[]): string => {
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (!element) continue;
        
        const text = element.textContent?.trim();
        if (text) {
          console.log(`Found text with selector ${selector}:`, text);
          return text;
        }
      }
      return "";
    };

    // Helper function to extract number from text
    const extractNumber = (text: string): number | null => {
      const match = text.replace(/\s/g, '').match(/\d+/);
      return match ? parseInt(match[0]) : null;
    };

    // Helper function to clean price
    const cleanPrice = (text: string): number | null => {
      const numStr = text.replace(/[^0-9]/g, '');
      return numStr ? parseInt(numStr) : null;
    };

    // Title selectors with more variations
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

    // Price selectors with more variations
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

    // Description selectors with more variations
    const descriptionSelectors = [
      '.description-text',
      '.listing-description',
      '[data-qaid="property-description"]',
      '[data-qaid="description"]',
      '.property-description',
      '.description',
      '[itemprop="description"]'
    ];

    // Address selectors with more variations
    const addressSelectors = [
      '.listing-address',
      '.property-address',
      '[data-qaid="property-address"]',
      '[data-qaid="address"]',
      '.property-address',
      '.address',
      '[itemprop="streetAddress"]'
    ];

    // City selectors with more variations
    const citySelectors = [
      '.listing-city',
      '.property-city',
      '[data-qaid="property-city"]',
      '[data-qaid="city"]',
      '.property-city',
      '.city',
      '[itemprop="addressLocality"]'
    ];

    // Bedrooms selectors with more variations
    const bedroomSelectors = [
      '.listing-bedrooms',
      '.property-bedrooms',
      '[data-qaid="property-bedrooms"]',
      '[data-qaid="bedrooms"]',
      '.property-bedrooms',
      '.bedrooms',
      '[itemprop="numberOfRooms"]'
    ];

    // Bathrooms selectors with more variations
    const bathroomSelectors = [
      '.listing-bathrooms',
      '.property-bathrooms',
      '[data-qaid="property-bathrooms"]',
      '[data-qaid="bathrooms"]',
      '.property-bathrooms',
      '.bathrooms'
    ];

    // Extract images with more specific selectors
    const imageSelectors = [
      'img.listing-image',
      'img.property-image',
      'img[data-qaid="property-photo"]',
      'img[class*="PropertyPhoto"]',
      'img[class*="propertyPhoto"]',
      '.property-photos img',
      '.photos img',
      '[data-qaid="photos"] img',
      '[class*="gallery"] img',
      '[class*="carousel"] img',
      'img[itemprop="image"]'
    ];

    const images: string[] = [];
    const seenUrls = new Set<string>();

    // Function to clean and validate image URL
    const cleanImageUrl = (url: string): string | null => {
      if (!url) return null;
      
      // Remove any query parameters
      const baseUrl = url.split('?')[0];
      
      // Ensure it's an image URL
      if (!baseUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return null;
      
      // Ensure it's not a tiny thumbnail
      if (baseUrl.includes('thumbnail') || baseUrl.includes('small')) return null;
      
      return baseUrl;
    };

    // Extract images from both src and data-src attributes
    for (const selector of imageSelectors) {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((img) => {
        const src = img.getAttribute("src");
        const dataSrc = img.getAttribute("data-src");
        
        [src, dataSrc].forEach(url => {
          if (!url) return;
          
          const cleanUrl = cleanImageUrl(url);
          if (cleanUrl && !seenUrls.has(cleanUrl)) {
            seenUrls.add(cleanUrl);
            images.push(cleanUrl);
            console.log('Found image:', cleanUrl);
          }
        });
      });
    }

    // Extract data
    const title = getTextFromSelectors(titleSelectors);
    const priceText = getTextFromSelectors(priceSelectors);
    const description = getTextFromSelectors(descriptionSelectors);
    const address = getTextFromSelectors(addressSelectors);
    const city = getTextFromSelectors(citySelectors);
    const bedroomsText = getTextFromSelectors(bedroomSelectors);
    const bathroomsText = getTextFromSelectors(bathroomSelectors);

    // Clean up price
    const price = priceText ? cleanPrice(priceText) : null;
    
    // Extract numbers for bedrooms and bathrooms
    const bedrooms = bedroomsText ? extractNumber(bedroomsText) : null;
    const bathrooms = bathroomsText ? extractNumber(bathroomsText) : null;

    // Extract Centris ID from URL
    const centrisId = url.split("/").pop() || "";

    const listing = {
      centris_id: centrisId,
      title: title || "Propriété à vendre",
      description: description || null,
      price,
      address: address || null,
      city: city || null,
      postal_code: null,
      bedrooms,
      bathrooms,
      property_type: "Résidentiel",
      images: images.length > 0 ? images : null
    };

    console.log('Extracted listing:', listing);

    return new Response(
      JSON.stringify(listing),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
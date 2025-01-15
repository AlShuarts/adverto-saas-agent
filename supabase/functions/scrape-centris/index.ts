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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
        const text = element?.textContent?.trim();
        if (text) {
          console.log(`Found text with selector ${selector}:`, text);
          return text;
        }
      }
      return "";
    };

    // Helper function to extract number from text
    const extractNumber = (text: string): number | null => {
      const match = text.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    };

    // Title selectors
    const titleSelectors = [
      '[data-qaid="property-title"]',
      '[data-qaid="property-description-title"]',
      '.property-title',
      '.description-title',
      'h1'
    ];

    // Price selectors
    const priceSelectors = [
      '[data-qaid="property-price"]',
      '[data-qaid="price"]',
      '.property-price',
      '.price'
    ];

    // Description selectors
    const descriptionSelectors = [
      '[data-qaid="property-description"]',
      '[data-qaid="description"]',
      '.property-description',
      '.description'
    ];

    // Address selectors
    const addressSelectors = [
      '[data-qaid="property-address"]',
      '[data-qaid="address"]',
      '.property-address',
      '.address'
    ];

    // City selectors
    const citySelectors = [
      '[data-qaid="property-city"]',
      '[data-qaid="city"]',
      '.property-city',
      '.city'
    ];

    // Bedrooms selectors
    const bedroomSelectors = [
      '[data-qaid="property-bedrooms"]',
      '[data-qaid="bedrooms"]',
      '.property-bedrooms',
      '.bedrooms'
    ];

    // Bathrooms selectors
    const bathroomSelectors = [
      '[data-qaid="property-bathrooms"]',
      '[data-qaid="bathrooms"]',
      '.property-bathrooms',
      '.bathrooms'
    ];

    // Extract images with more specific selectors
    const imageSelectors = [
      'img[data-qaid="property-photo"]',
      'img[class*="PropertyPhoto"]',
      'img[class*="propertyPhoto"]',
      '.property-photos img',
      '.photos img',
      '[data-qaid="photos"] img',
      '[class*="gallery"] img',
      '[class*="carousel"] img'
    ];

    const images: string[] = [];
    for (const selector of imageSelectors) {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((img) => {
        const src = img.getAttribute("src") || img.getAttribute("data-src");
        if (src && !src.includes("placeholder") && !images.includes(src)) {
          console.log('Found image:', src);
          images.push(src);
        }
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

    // Clean up price (remove $ and spaces)
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, "")) : null;
    
    // Extract numbers for bedrooms and bathrooms
    const bedrooms = bedroomsText ? extractNumber(bedroomsText) : null;
    const bathrooms = bathroomsText ? extractNumber(bathroomsText) : null;

    // Extract Centris ID from URL
    const centrisId = url.split("/").pop() || "";

    const listing = {
      centris_id: centrisId,
      title: title || "Propriété à vendre",
      description,
      price,
      address,
      city,
      postal_code: null, // We'll extract this from address if needed
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
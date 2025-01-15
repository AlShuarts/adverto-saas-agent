import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
    console.log('First 500 characters of HTML:', html.substring(0, 500));
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    console.log('HTML parsed successfully');

    // Extract listing information with multiple fallback selectors
    const titleSelectors = [
      ".description-container h1",
      "h1.headingLarge",
      ".address-container h1",
      "[class*='Title']",
      "[class*='title']",
      "h1"
    ];
    
    let title = "";
    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        title = element.textContent.trim();
        console.log('Title found with selector:', selector);
        break;
      }
    }

    const priceSelectors = [
      "[class*='price']",
      "[class*='Price']",
      ".price-container",
      "[data-qaid='price']"
    ];
    
    let price = "";
    for (const selector of priceSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        price = element.textContent.trim();
        console.log('Price found with selector:', selector);
        break;
      }
    }

    const descriptionSelectors = [
      "[class*='description']",
      ".teaser",
      "[data-qaid='description']",
      "#description"
    ];
    
    let description = "";
    for (const selector of descriptionSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        description = element.textContent.trim();
        console.log('Description found with selector:', selector);
        break;
      }
    }

    const addressSelectors = [
      "[class*='address']",
      ".address-container",
      "[data-qaid='address']"
    ];
    
    let address = "";
    for (const selector of addressSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        address = element.textContent.trim();
        console.log('Address found with selector:', selector);
        break;
      }
    }

    const citySelectors = [
      "[class*='city']",
      ".city-container",
      "[data-qaid='city']"
    ];
    
    let city = "";
    for (const selector of citySelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        city = element.textContent.trim();
        console.log('City found with selector:', selector);
        break;
      }
    }

    const bedroomSelectors = [
      "[class*='bedroom']",
      "[class*='Bedroom']",
      "[data-qaid='bedrooms']"
    ];
    
    let bedrooms = null;
    for (const selector of bedroomSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        const match = element.textContent.trim().match(/\d+/);
        if (match) {
          bedrooms = parseInt(match[0]);
          console.log('Bedrooms found with selector:', selector);
          break;
        }
      }
    }

    const bathroomSelectors = [
      "[class*='bathroom']",
      "[class*='Bathroom']",
      "[data-qaid='bathrooms']"
    ];
    
    let bathrooms = null;
    for (const selector of bathroomSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        const match = element.textContent.trim().match(/\d+/);
        if (match) {
          bathrooms = parseInt(match[0]);
          console.log('Bathrooms found with selector:', selector);
          break;
        }
      }
    }

    // Extract images with more flexible selectors
    const images: string[] = [];
    const imageSelectors = [
      "img[class*='photo']",
      "img[class*='Photo']",
      ".slider img",
      "[data-qaid='photos'] img",
      "[class*='gallery'] img"
    ];
    
    for (const selector of imageSelectors) {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && !src.includes("placeholder") && !images.includes(src)) {
          images.push(src);
        }
      });
    }
    console.log('Number of images found:', images.length);

    // Extract Centris ID from URL
    const centrisId = url.split("/").pop() || "";
    console.log('Centris ID:', centrisId);

    const listing = {
      centris_id: centrisId,
      title: title || "Propriété à vendre",
      description,
      price: price ? parseFloat(price.replace(/[^0-9.]/g, "")) : null,
      address,
      city,
      postal_code: null, // We'll need to extract this from the address
      bedrooms,
      bathrooms,
      property_type: "Résidentiel", // Default value as it's hard to extract consistently
      images
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
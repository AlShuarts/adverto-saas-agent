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

    const response = await fetch(url);
    const html = await response.text();
    console.log('HTML content length:', html.length);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    console.log('HTML parsed successfully');

    // Extract listing information with more specific selectors
    const title = doc.querySelector(".description-container h1")?.textContent?.trim() || 
                 doc.querySelector("h1.headingLarge")?.textContent?.trim() || "";
    console.log('Title found:', title);

    const priceElement = doc.querySelector("[class*='price']") || 
                        doc.querySelector("[class*='Price']");
    const price = priceElement?.textContent?.trim() || "";
    console.log('Price found:', price);

    const description = doc.querySelector("[class*='description']")?.textContent?.trim() || 
                       doc.querySelector(".teaser")?.textContent?.trim() || "";
    console.log('Description found:', Boolean(description));

    const address = doc.querySelector("[class*='address']")?.textContent?.trim() || "";
    console.log('Address found:', address);

    const city = doc.querySelector("[class*='city']")?.textContent?.trim() || "";
    const postalCode = doc.querySelector("[class*='postal']")?.textContent?.trim() || "";
    
    // Extract property details with flexible selectors
    const bedroomsText = doc.querySelector("[class*='bedroom']")?.textContent?.trim() || "";
    const bedrooms = bedroomsText ? parseInt(bedroomsText.match(/\d+/)?.[0] || "0") : null;
    
    const bathroomsText = doc.querySelector("[class*='bathroom']")?.textContent?.trim() || "";
    const bathrooms = bathroomsText ? parseInt(bathroomsText.match(/\d+/)?.[0] || "0") : null;
    
    const propertyType = doc.querySelector("[class*='category']")?.textContent?.trim() || "";

    // Extract images with more flexible selectors
    const images: string[] = [];
    doc.querySelectorAll("img[class*='photo'], img[class*='Photo'], .slider img").forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !src.includes("placeholder")) {
        images.push(src);
      }
    });
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
      postal_code: postalCode,
      bedrooms,
      bathrooms,
      property_type: propertyType,
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
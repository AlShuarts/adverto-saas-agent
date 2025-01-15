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

    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Extract listing information
    const title = doc.querySelector("h1")?.textContent?.trim() || "";
    const price = doc.querySelector("[data-id='Price']")?.textContent?.trim() || "";
    const description = doc.querySelector("[data-id='Description']")?.textContent?.trim() || "";
    const address = doc.querySelector("[data-id='Address']")?.textContent?.trim() || "";
    const city = doc.querySelector("[data-id='City']")?.textContent?.trim() || "";
    const postalCode = doc.querySelector("[data-id='PostalCode']")?.textContent?.trim() || "";
    const bedrooms = doc.querySelector("[data-id='Bedrooms']")?.textContent?.trim() || "";
    const bathrooms = doc.querySelector("[data-id='Bathrooms']")?.textContent?.trim() || "";
    const propertyType = doc.querySelector("[data-id='PropertyType']")?.textContent?.trim() || "";

    // Extract images
    const images: string[] = [];
    doc.querySelectorAll("[data-id='Photos'] img").forEach((img) => {
      const src = img.getAttribute("src");
      if (src) images.push(src);
    });

    // Extract Centris ID from URL
    const centrisId = url.split("/").pop() || "";

    console.log('Scraped data:', { title, price, address });

    const listing = {
      centris_id: centrisId,
      title,
      description,
      price: parseFloat(price.replace(/[^0-9.]/g, "")),
      address,
      city,
      postal_code: postalCode,
      bedrooms: parseInt(bedrooms) || null,
      bathrooms: parseInt(bathrooms) || null,
      property_type: propertyType,
      images
    };

    return new Response(JSON.stringify(listing), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
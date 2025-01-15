import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HtmlParser } from "./html-parser.ts";
import { ImageProcessor } from "./image-processor.ts";
import { ListingData } from "./types.ts";

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

    // Add custom headers to bypass potential restrictions
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch Centris page:', response.status, response.statusText);
      throw new Error('Failed to fetch Centris page');
    }

    const html = await response.text();
    console.log('HTML content length:', html.length);
    console.log('First 500 characters of HTML:', html.substring(0, 500));
    
    const parser = new HtmlParser(html);
    const imageProcessor = new ImageProcessor();
    
    const centrisId = url.split("/").pop() || "";
    const listingData = parser.parseListing(centrisId);
    
    // Process images
    const imageUrls = parser.getImageUrls();
    console.log('Found image URLs:', imageUrls);
    
    const processedImages: string[] = [];
    
    for (const imageUrl of imageUrls) {
      console.log('Processing image URL:', imageUrl);
      const { processedUrl, error } = await imageProcessor.processImage(imageUrl);
      if (processedUrl) {
        processedImages.push(processedUrl);
        console.log('Successfully processed image:', processedUrl);
      } else {
        console.error('Failed to process image:', error);
      }
    }

    const listing: ListingData = {
      ...listingData,
      images: processedImages.length > 0 ? processedImages : null
    };

    console.log('Final listing data:', listing);

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
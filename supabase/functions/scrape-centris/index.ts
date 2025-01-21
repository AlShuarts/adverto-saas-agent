import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HtmlParser } from "./html-parser.ts";
import { ImageProcessor } from "./image-processor.ts";
import { ListingData } from "./types.ts";
import { scrapingHeaders } from "./scraping-headers.ts";

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
    console.log('URL à scraper:', url);

    if (!url.includes("centris.ca")) {
      return new Response(
        JSON.stringify({ error: "L'URL doit provenir de centris.ca" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const response = await fetch(url, { headers: scrapingHeaders });
    
    if (!response.ok) {
      console.error('Échec de la récupération de la page Centris:', response.status, response.statusText);
      throw new Error('Échec de la récupération de la page Centris');
    }

    const html = await response.text();
    console.log('Longueur du HTML:', html.length);
    
    const parser = new HtmlParser(html);
    const imageProcessor = new ImageProcessor();
    
    const centrisId = url.split("/").pop() || "";
    const listingData = parser.parseListing(centrisId);
    
    // Traitement des images
    const imageUrls = parser.getImageUrls();
    console.log('URLs d\'images trouvées:', imageUrls);
    
    const processedImages: string[] = [];
    const errors: string[] = [];
    
    for (const imageUrl of imageUrls) {
      console.log('Traitement de l\'URL d\'image:', imageUrl);
      const { processedUrl, error } = await imageProcessor.processImage(imageUrl);
      
      if (processedUrl) {
        processedImages.push(processedUrl);
        console.log('Image traitée avec succès:', processedUrl);
      } else {
        console.error('Échec du traitement de l\'image:', error);
        errors.push(`Échec pour ${imageUrl}: ${error}`);
      }
    }

    if (processedImages.length === 0 && errors.length > 0) {
      console.error('Aucune image n\'a pu être traitée. Erreurs:', errors);
      throw new Error('Impossible de traiter les images: ' + errors.join(', '));
    }

    const listing: ListingData = {
      ...listingData,
      images: processedImages.length > 0 ? processedImages : null
    };

    console.log('Données finales de l\'annonce:', listing);

    return new Response(
      JSON.stringify(listing),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
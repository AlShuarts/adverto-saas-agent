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
      console.error('URL invalide:', url);
      return new Response(
        JSON.stringify({ error: "L'URL doit provenir de centris.ca" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const headers = {
      ...scrapingHeaders,
      'Referer': 'https://www.centris.ca/',
      'Origin': 'https://www.centris.ca',
      'Cookie': ''  // Ajout d'un cookie vide pour éviter les redirections
    };

    console.log('Headers de la requête:', headers);
    const response = await fetch(url, { 
      headers,
      redirect: 'follow'  // Suivre les redirections
    });
    
    if (!response.ok) {
      console.error('Échec de la récupération de la page Centris:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Échec de la récupération de la page Centris: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Longueur du HTML:', html.length);
    
    if (html.length < 1000) {
      console.error('HTML reçu trop court:', html);
      throw new Error('Page Centris non valide ou vide');
    }
    
    const parser = new HtmlParser(html);
    const imageProcessor = new ImageProcessor();
    
    const centrisId = url.split("/").pop()?.split("?")[0] || "";
    console.log('ID Centris extrait:', centrisId);
    
    const listingData = parser.parseListing(centrisId);
    console.log('Données de base extraites:', listingData);
    
    const imageUrls = parser.getImageUrls();
    console.log('URLs d\'images trouvées:', imageUrls);
    
    const processedImages: string[] = [];
    
    if (imageUrls.length === 0) {
      console.error('Aucune image trouvée dans le HTML');
    }
    
    for (const imageUrl of imageUrls) {
      console.log('Traitement de l\'URL d\'image:', imageUrl);
      const { processedUrl, error } = await imageProcessor.processImage(imageUrl);
      
      if (processedUrl) {
        processedImages.push(processedUrl);
        console.log('Image traitée avec succès:', processedUrl);
      } else {
        console.error('Échec du traitement de l\'image:', error);
      }
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
    console.error('Erreur détaillée:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        type: error.constructor.name
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
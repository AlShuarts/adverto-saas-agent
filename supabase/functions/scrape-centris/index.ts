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

    // Configuration améliorée des headers
    const headers = {
      ...scrapingHeaders,
      'Referer': 'https://www.centris.ca/',
      'Origin': 'https://www.centris.ca',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };
    
    console.log('Headers de la requête:', headers);
    
    // Ajouter un délai aléatoire pour éviter la détection
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    const response = await fetch(url, { 
      headers,
      redirect: 'follow',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      console.error('Échec de la récupération de la page Centris:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
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
    
    if (imageUrls.length === 0) {
      console.error('Aucune image trouvée dans le HTML');
      console.log('Contenu HTML:', html);
      throw new Error("Aucune image n'a été trouvée dans l'annonce. Veuillez vérifier que l'URL est correcte et que l'annonce contient des images.");
    }
    
    const processedImages: string[] = [];
    let errorCount = 0;
    const maxErrors = Math.ceil(imageUrls.length * 0.3); // Permet jusqu'à 30% d'erreurs
    
    for (const imageUrl of imageUrls) {
      try {
        console.log(`Traitement de l'image ${processedImages.length + 1}/${imageUrls.length}:`, imageUrl);
        const { processedUrl, error } = await imageProcessor.processImage(imageUrl);
        
        if (processedUrl) {
          processedImages.push(processedUrl);
          console.log('Image traitée avec succès:', processedUrl);
        } else {
          console.error('Échec du traitement de l\'image:', error);
          errorCount++;
        }
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        errorCount++;
      }
      
      if (errorCount > maxErrors) {
        console.error(`Trop d'erreurs lors du traitement des images (${errorCount} erreurs)`);
        throw new Error("Trop d'erreurs lors du traitement des images. Veuillez réessayer.");
      }
      
      // Petit délai entre chaque traitement d'image
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (processedImages.length === 0) {
      console.error(`Toutes les tentatives de traitement d'images ont échoué (${errorCount} erreurs)`);
      throw new Error("Impossible de traiter les images de l'annonce. Veuillez réessayer.");
    }

    const listing: ListingData = {
      ...listingData,
      images: processedImages,
      original_images: imageUrls
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
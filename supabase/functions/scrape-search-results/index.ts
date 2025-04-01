
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { extractListingUrls } from "../scrape-broker-profile/extractors/listing-extractor.ts";
import { fetchWithRetry } from "../scrape-broker-profile/utils/request-utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchUrl, page = 1 } = await req.json();
    console.log('URL à scraper:', searchUrl);

    if (!searchUrl.includes("centris.ca")) {
      return new Response(
        JSON.stringify({ error: "L'URL doit provenir de centris.ca" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log('Utilisation de fetchWithRetry pour obtenir une meilleure fiabilité');
    
    // Utiliser la fonction fetchWithRetry du module request-utils qui fonctionne bien pour le scraping d'annonce unique
    const { html, error: fetchError } = await fetchWithRetry(searchUrl);
    
    if (fetchError) {
      console.error('Erreur lors de la récupération de la page:', fetchError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la récupération: ${fetchError}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log('HTML length:', html.length);
    
    // Extract listing URLs from the search results page
    let listingUrls = extractListingUrls(html);
    
    if (listingUrls.length === 0) {
      // Try alternative extraction method for property cards
      const propertyCardRegex = /<div\s+class="[^"]*(?:thumbnail-cell|property-thumbnail)[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi;
      const alternativeUrls = [];
      let match;
      
      while ((match = propertyCardRegex.exec(html)) !== null) {
        if (match && match[1]) {
          let url = match[1];
          if (url.startsWith('/')) {
            url = `https://www.centris.ca${url}`;
          }
          if (isValidListingUrl(url)) {
            alternativeUrls.push(url);
          }
        }
      }
      
      if (alternativeUrls.length > 0) {
        console.log(`Found ${alternativeUrls.length} listings with alternative extraction`);
        listingUrls = alternativeUrls;
      } else {
        const htmlExcerpt = html.substring(0, 1000);
        console.log('HTML excerpt for debugging:', htmlExcerpt);
        return new Response(
          JSON.stringify({ 
            error: "Aucune annonce trouvée dans les résultats de recherche",
            listingUrls: []
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }

    console.log(`Found ${listingUrls.length} listing URLs`);
    
    return new Response(
      JSON.stringify({
        listingUrls,
        total: listingUrls.length,
      }),
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

// Check if a URL is a valid Centris listing URL
function isValidListingUrl(url: string): boolean {
  // Must be a Centris URL
  if (!url.includes('centris.ca')) {
    return false;
  }
  
  // Must have a language indicator
  const hasLanguage = url.includes('/fr/') || url.includes('/en/');
  if (!hasLanguage) {
    return false;
  }
  
  // Must have a property type indicator
  const frenchTypes = ['maison', 'condo', 'terrain', 'propriete', 'ferme', 'commerce', 'multiplex'];
  const englishTypes = ['house', 'condo', 'lot', 'property', 'farm', 'commercial', 'multiplex', 'plex'];
  
  const hasPropertyType = 
    frenchTypes.some(type => url.includes(`/fr/${type}`)) || 
    englishTypes.some(type => url.includes(`/en/${type}`));
  
  if (!hasPropertyType) {
    return false;
  }
  
  // Must end with a numeric ID
  const endsWithId = /\/[0-9]+$/.test(url);
  if (!endsWithId) {
    return false;
  }
  
  return true;
}

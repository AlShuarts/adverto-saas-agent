
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { extractListingUrls, alternativeExtractListingUrls } from "../scrape-broker-profile/extractors/listing-extractor.ts";

// Import the headers from the successful scrape-centris function
import { scrapingHeaders } from "../scrape-centris/scraping-headers.ts";

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

    // Get the actual search URL with parameters
    let scrapingUrl = searchUrl;
    
    // Add parameters if they don't exist to ensure we get a consistent view
    if (!scrapingUrl.includes('view=')) {
      scrapingUrl += (scrapingUrl.includes('?') ? '&' : '?') + 'view=Thumbnail';
    }
    
    if (!scrapingUrl.includes('ps=')) {
      // Set page size to a smaller value (20) to reduce suspicion
      scrapingUrl += (scrapingUrl.includes('?') ? '&' : '?') + 'ps=20';
    }
    
    console.log('URL optimisée pour le scraping:', scrapingUrl);
    
    // Add a random delay before fetching to mimic human behavior (1-3 seconds)
    const randomDelay = 1000 + Math.floor(Math.random() * 2000);
    console.log(`Délai aléatoire avant requête: ${randomDelay}ms`);
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    // Use the direct fetch method with the same headers as the single listing scraper
    // This replaces the fetchWithRetry function to ensure consistency
    console.log('Envoi de la requête avec les headers de scrape-centris');
    const response = await fetch(scrapingUrl, { 
      headers: scrapingHeaders
    });
    
    if (!response.ok) {
      console.error('Échec de la récupération de la page:', response.status, response.statusText);
      
      // Check if we got blocked or rate limited
      if (response.status === 403 || response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Accès bloqué par Centris. L'application est détectée comme un robot.",
            captchaDetected: true
          }),
          { 
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      throw new Error(`Échec de la récupération de la page: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('HTML length:', html.length);
    
    // Check early for captcha detection before attempting extraction
    if (html.toLowerCase().includes('captcha') || 
        html.toLowerCase().includes('robot') || 
        html.toLowerCase().includes('access denied')) {
      console.error('Captcha or access denied detected');
      return new Response(
        JSON.stringify({ 
          error: "Accès bloqué par Centris. L'application est détectée comme un robot.",
          htmlPreview: html.substring(0, 1000),
          captchaDetected: true
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Extract listing URLs using multiple methods for the best chance of success
    let listingUrls = extractListingUrls(html);
    console.log(`First extraction method found ${listingUrls.length} listings`);
    
    // If primary method fails, try the alternative extraction
    if (listingUrls.length === 0) {
      console.log('Trying alternative extraction method...');
      listingUrls = alternativeExtractListingUrls(html);
      console.log(`Alternative extraction found ${listingUrls.length} listings`);
    }
    
    // Try a direct basic extraction as last resort
    if (listingUrls.length === 0) {
      console.log('Trying basic regex extraction as last resort...');
      const basicUrlRegex = /href="(https?:\/\/www\.centris\.ca\/fr\/(?:maison|condo|terrain|propriete|ferme|commerce|multiplex)[^"]+\/[0-9]+)"/g;
      const matches = [...html.matchAll(basicUrlRegex)];
      const directUrls = matches.map(match => match[1]);
      
      // Filter to unique URLs
      const uniqueUrls = [...new Set(directUrls)];
      
      if (uniqueUrls.length > 0) {
        listingUrls = uniqueUrls;
        console.log(`Basic regex extraction found ${listingUrls.length} listings`);
      }
    }
    
    if (listingUrls.length === 0) {
      // If we still couldn't find any listings, log an HTML excerpt for debugging
      const htmlExcerpt = html.substring(0, 1000);
      console.log('HTML excerpt for debugging:', htmlExcerpt);
      
      return new Response(
        JSON.stringify({ 
          error: "Aucune annonce trouvée dans les résultats de recherche",
          listingUrls: [],
          htmlPreview: htmlExcerpt
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Found ${listingUrls.length} listing URLs`);
    
    return new Response(
      JSON.stringify({
        listingUrls,
        total: listingUrls.length
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

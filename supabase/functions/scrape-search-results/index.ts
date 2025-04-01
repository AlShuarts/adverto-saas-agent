
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../scrape-broker-profile/utils/request-utils.ts";
import { extractListingUrls, alternativeExtractListingUrls } from "../scrape-broker-profile/extractors/listing-extractor.ts";

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
      // Set page size to 40 to get more results per request
      scrapingUrl += (scrapingUrl.includes('?') ? '&' : '?') + 'ps=40';
    }
    
    console.log('URL optimisée pour le scraping:', scrapingUrl);
    
    // Use the fetchWithRetry function that works well for single listing imports
    const { html, error: fetchError, status } = await fetchWithRetry(scrapingUrl);
    
    if (fetchError) {
      console.error('Erreur lors de la récupération de la page:', fetchError);
      
      if (html && html.length > 0) {
        console.log('HTML length despite error:', html.length);
        // Continue with the HTML we got even with error, we might be able to extract some data
      } else {
        return new Response(
          JSON.stringify({ error: `Erreur lors de la récupération: ${fetchError}` }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }
    
    console.log('HTML length:', html.length);
    
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
      // If we still couldn't find any listings, check if we got a captcha or access denied
      if (html.toLowerCase().includes('captcha') || 
          html.toLowerCase().includes('robot') || 
          html.toLowerCase().includes('access denied')) {
        console.error('Captcha or access denied detected');
        return new Response(
          JSON.stringify({ 
            error: "Accès bloqué par Centris. L'application est peut-être détectée comme un robot.",
            htmlPreview: html.substring(0, 1000),
            captchaDetected: true
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      // Log an HTML excerpt for debugging
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
        total: listingUrls.length,
        status: status,
        fetchError: fetchError,
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

// Make sure function has correct memory limit in config.toml

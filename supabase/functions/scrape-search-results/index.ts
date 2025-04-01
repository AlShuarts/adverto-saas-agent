
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { extractListingUrls } from "../scrape-broker-profile/extractors/listing-extractor.ts";
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

    // Add a delay between 1-3 seconds to simulate human behavior
    const delayMs = 1000 + Math.floor(Math.random() * 2000);
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Randomize user agent to avoid detection
    const randomUserAgent = getRandomUserAgent();
    const customHeaders = {
      ...scrapingHeaders,
      'User-Agent': randomUserAgent,
      'Referer': 'https://www.centris.ca/fr',
    };
    
    console.log(`Using User-Agent: ${randomUserAgent}`);

    // Fetch the search results page
    const response = await fetch(searchUrl, { 
      headers: customHeaders 
    });
    
    if (!response.ok) {
      console.error('Failed to fetch search results:', response.status, response.statusText);
      
      if (response.status === 403 || response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Accès temporairement bloqué par Centris. Réessayez plus tard." }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML length:', html.length);
    
    // Check for captcha or access denied indicators
    if (
      html.toLowerCase().includes('captcha') || 
      html.toLowerCase().includes('access denied') ||
      (html.toLowerCase().includes('robot') && html.toLowerCase().includes('detect'))
    ) {
      console.error('Captcha or access denied detected');
      return new Response(
        JSON.stringify({ error: "Protection anti-bot détectée. Réessayez plus tard." }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
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

// Array of different user agents for rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Get a random user agent from the array
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

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

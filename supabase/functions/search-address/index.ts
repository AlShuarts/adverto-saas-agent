
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Search agents to rotate between
const searchAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0",
];

// Get a random user agent to avoid detection
const getRandomUserAgent = () => {
  return searchAgents[Math.floor(Math.random() * searchAgents.length)];
};

interface SearchResult {
  title: string;
  url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    
    if (!address || typeof address !== 'string') {
      return new Response(
        JSON.stringify({ error: "Une adresse valide est requise" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Recherche pour l'adresse: ${address}`);

    // Format search query to specifically target Centris
    const searchQuery = encodeURIComponent(`${address} site:centris.ca`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    console.log(`URL de recherche Google: ${searchUrl}`);

    // Make the request with a random user agent
    const userAgent = getRandomUserAgent();
    console.log(`Utilisation de l'User-Agent: ${userAgent}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.google.com/',
      }
    });

    if (!response.ok) {
      console.error(`Erreur lors de la recherche Google: ${response.status}`);
      throw new Error(`Erreur lors de la recherche: ${response.status}`);
    }

    const html = await response.text();
    
    // Check for captcha/detection patterns
    if (
      html.includes("unusual traffic") ||
      html.includes("captcha") ||
      html.includes("verify you're a human")
    ) {
      console.error("Détection de bot par Google");
      throw new Error("La recherche a été bloquée par Google. Veuillez réessayer plus tard.");
    }
    
    console.log(`Longueur du HTML reçu: ${html.length} caractères`);

    // Extract Centris links from the search results
    const results: SearchResult[] = [];
    
    // Pattern for Google search result links
    const linkPattern = /<a\s+[^>]*href="(https:\/\/www.centris.ca\/[^"]*)"[^>]*>(.*?)<\/a>/gi;
    let match;
    
    while ((match = linkPattern.exec(html)) !== null) {
      const url = match[1];
      const titleMatch = /<h3[^>]*>(.*?)<\/h3>/i.exec(match[0]);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : "Annonce Centris";
      
      // Only include property listings
      if (
        url.includes("/fr/propriete/") || 
        url.includes("/en/property/") ||
        url.includes("/fr/maison~a-vendre/") ||
        url.includes("/en/house~for-sale/")
      ) {
        results.push({ url, title });
      }
    }
    
    console.log(`Nombre de résultats trouvés: ${results.length}`);
    
    // Return the search results
    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur est survenue lors de la recherche" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

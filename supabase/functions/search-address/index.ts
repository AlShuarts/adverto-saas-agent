
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
  console.log("=== DÉBUT DE LA FONCTION SEARCH-ADDRESS ===");
  console.log(`Méthode: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Requête OPTIONS - Réponse CORS");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Tentative d'analyse du corps de la requête...");
    const requestBody = await req.text();
    console.log(`Corps de la requête brut: ${requestBody}`);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
      console.log(`Corps de la requête parsé:`, parsedBody);
    } catch (parseError) {
      console.error(`Erreur de parsing JSON: ${parseError.message}`);
      return new Response(
        JSON.stringify({ error: "Format de requête invalide", details: parseError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const { address } = parsedBody;
    
    if (!address || typeof address !== 'string') {
      console.error(`Adresse invalide: ${address}`);
      return new Response(
        JSON.stringify({ error: "Une adresse valide est requise" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Recherche pour l'adresse: ${address}`);

    // Construction de l'URL de recherche Centris
    // Format: https://www.centris.ca/fr/propriete~a-vendre?view=Thumbnail&query=address
    const searchTerm = encodeURIComponent(address.trim());
    const searchUrl = `https://www.centris.ca/fr/propriete~a-vendre?view=Thumbnail&query=${searchTerm}`;
    console.log(`URL de recherche Centris: ${searchUrl}`);

    // Make the request with a random user agent
    const userAgent = getRandomUserAgent();
    console.log(`Utilisation de l'User-Agent: ${userAgent}`);
    
    console.log("Démarrage de la requête vers Centris...");
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.centris.ca/',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
      }
    });

    console.log(`Statut de la réponse Centris: ${response.status} ${response.statusText}`);
    console.log(`Headers de la réponse:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`Erreur lors de la recherche Centris: ${response.status}`);
      throw new Error(`Erreur lors de la recherche: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Longueur du HTML reçu: ${html.length} caractères`);
    
    // Log the first 200 characters to see what we're getting
    console.log(`Aperçu du HTML: ${html.substring(0, 200)}...`);
    
    // Extract Centris listing URLs and titles using multiple patterns
    const results: SearchResult[] = [];
    
    // Réutilisation des fonctions d'extraction du scrape-search-results
    console.log("Extraction des annonces des résultats de recherche...");
    
    // Multiple patterns for finding listing URLs
    const patterns = [
      // Standard property card pattern
      /<div class="[^"]*thumbnail[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi,
      
      // Property row pattern
      /<div\s+class="(?:[^"]*\s)?property-row(?:\s[^"]*)?">[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi,
      
      // Property item pattern
      /<div\s+class="[^"]*(?:property-thumbnail-item|property|property-item)[^"]*"[^>]*>[\s\S]*?href="([^"]+)"[\s\S]*?<\/div>/gi,
      
      // Direct URL links to properties
      /href="((?:https:\/\/www\.centris\.ca)?\/fr\/(?:maison|condo|terrain|propriete|ferme|commerce|multiplex)(?:~|\/)[^"]+\/[0-9]+)"/g,
    ];
    
    const foundUrls = new Set<string>();
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match && match[1]) {
          let url = match[1];
          
          // Normalize URL
          if (url.startsWith('/')) {
            url = `https://www.centris.ca${url}`;
          } else if (!url.startsWith('http')) {
            url = `https://www.centris.ca/${url}`;
          }
          
          // Validate URL
          if (isValidCentrisUrl(url) && !foundUrls.has(url)) {
            console.log(`URL valide trouvée: ${url}`);
            foundUrls.add(url);
            
            // Extract property title
            let title = extractTitleForUrl(html, url) || "Annonce Centris";
            results.push({ url, title });
          }
        }
      }
    }
    
    console.log(`${results.length} résultats trouvés`);
    
    if (results.length === 0) {
      console.log("Aucun résultat trouvé, recherche de codes d'erreur ou de patterns alternatifs...");
      
      if (html.includes("aucun résultat") || html.includes("Aucun résultat")) {
        console.log("La page indique qu'aucun résultat n'a été trouvé");
      }
      
      // Try alternative extraction as last resort
      const allLinks = html.match(/<a[^>]*href="([^"#]+)"[^>]*>/gi);
      if (allLinks) {
        console.log(`Trouvé ${allLinks.length} liens au total, filtrage pour les propriétés...`);
        for (const link of allLinks) {
          const urlMatch = link.match(/href="([^"]+)"/i);
          if (urlMatch && urlMatch[1]) {
            const url = normalizeUrl(urlMatch[1]);
            if (isValidCentrisUrl(url) && !foundUrls.has(url)) {
              console.log(`URL alternative trouvée: ${url}`);
              foundUrls.add(url);
              
              let title = extractTitleForUrl(html, url) || "Annonce Centris";
              results.push({ url, title });
            }
          }
        }
      }
    }
    
    if (results.length === 0) {
      // Log a portion of HTML for debugging
      console.log("Aucune annonce trouvée. Extrait HTML pour débogage:");
      console.log(html.substring(0, 3000)); // Log a larger portion for debugging
    } else {
      console.log("Premiers résultats:", results.slice(0, 3));
    }
    
    // Return the search results
    console.log("=== FIN DE LA FONCTION SEARCH-ADDRESS ===");
    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    console.error("Stack trace:", error.stack);
    
    console.log("=== FIN DE LA FONCTION SEARCH-ADDRESS (avec erreur) ===");
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur est survenue lors de la recherche",
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

// Validate if a URL is a valid Centris property URL
function isValidCentrisUrl(url: string): boolean {
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

// Normalize a URL
function normalizeUrl(url: string): string {
  // Expand relative URLs
  if (url.startsWith('/')) {
    url = `https://www.centris.ca${url}`;
  } else if (!url.startsWith('http')) {
    url = `https://www.centris.ca/${url}`;
  }
  
  // Ensure URL is properly encoded
  try {
    url = new URL(url).toString();
  } catch (e) {
    console.error('Invalid URL:', url, e);
  }
  
  return url;
}

// Extract title for a URL from HTML
function extractTitleForUrl(html: string, url: string): string | null {
  try {
    // Try different patterns to find title
    // 1. Find title near the URL
    const urlPart = url.replace(/https?:\/\/[^\/]+/, '');
    const titlePattern = new RegExp(`href="[^"]*${escapeRegExp(urlPart)}[^"]*"[^>]*>[\\s\\S]*?<h3[^>]*>([^<]+)<\/h3>`, 'i');
    const titleMatch = titlePattern.exec(html);
    
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    // 2. Extract from URL itself
    const pathParts = url.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && /\d+/.test(lastPart)) {
      const secondLastPart = pathParts[pathParts.length - 2];
      if (secondLastPart) {
        return secondLastPart
          .replace(/~/g, ' ')
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  } catch (e) {
    console.error('Erreur lors de l\'extraction du titre:', e);
  }
  
  return null;
}

// Helper to escape special characters in regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

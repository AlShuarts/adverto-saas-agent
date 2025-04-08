
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

    // Format search query to specifically target Centris
    const searchQuery = encodeURIComponent(`${address} site:centris.ca`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    console.log(`URL de recherche Google: ${searchUrl}`);

    // Make the request with a random user agent
    const userAgent = getRandomUserAgent();
    console.log(`Utilisation de l'User-Agent: ${userAgent}`);
    
    console.log("Démarrage de la requête vers Google...");
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.google.com/',
      }
    });

    console.log(`Statut de la réponse Google: ${response.status} ${response.statusText}`);
    console.log(`Headers de la réponse:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`Erreur lors de la recherche Google: ${response.status}`);
      throw new Error(`Erreur lors de la recherche: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Longueur du HTML reçu: ${html.length} caractères`);
    
    // Log the first 200 characters to see what we're getting
    console.log(`Aperçu du HTML: ${html.substring(0, 200)}...`);
    
    // Check for captcha/detection patterns
    if (
      html.includes("unusual traffic") ||
      html.includes("captcha") ||
      html.includes("verify you're a human")
    ) {
      console.error("Détection de bot par Google");
      console.log("Extrait du HTML contenant probablement le captcha:", html.substring(0, 1000));
      throw new Error("La recherche a été bloquée par Google. Veuillez réessayer plus tard.");
    }

    // Extract Centris links from the search results
    const results: SearchResult[] = [];
    
    // Amélioration: différentes patterns d'extraction pour couvrir plus de formats de résultats Google
    const extractCentrisUrls = (html: string) => {
      console.log("Début de l'extraction des URLs Centris...");
      // Pattern 1: Extraire les liens directs
      const pattern1 = /href="(https:\/\/www\.centris\.ca\/[^"]+)"/gi;
      let match;
      const urls = new Set<string>();
      
      console.log("Application du pattern 1 (liens directs)...");
      while ((match = pattern1.exec(html)) !== null) {
        const url = match[1];
        console.log(`URL trouvée (pattern 1): ${url}`);
        if (isValidCentrisUrl(url)) {
          console.log(`URL valide ajoutée: ${url}`);
          urls.add(url);
        } else {
          console.log(`URL non valide ignorée: ${url}`);
        }
      }
      
      // Pattern 2: Extraire les URL encodées (parfois Google encode les URL)
      console.log("Application du pattern 2 (liens encodés)...");
      const pattern2 = /href="\/url\?q=(https:\/\/www\.centris\.ca\/[^&]+)/gi;
      while ((match = pattern2.exec(html)) !== null) {
        const url = decodeURIComponent(match[1]);
        console.log(`URL trouvée (pattern 2): ${url}`);
        if (isValidCentrisUrl(url)) {
          console.log(`URL valide ajoutée: ${url}`);
          urls.add(url);
        } else {
          console.log(`URL non valide ignorée: ${url}`);
        }
      }
      
      // Pattern 3: Essayer un pattern plus générique pour les URL en cache
      console.log("Application du pattern 3 (liens génériques)...");
      const pattern3 = /https:\/\/www\.centris\.ca\/[^"&'\s)]+/gi;
      while ((match = pattern3.exec(html)) !== null) {
        const url = match[0];
        console.log(`URL trouvée (pattern 3): ${url}`);
        if (isValidCentrisUrl(url)) {
          console.log(`URL valide ajoutée: ${url}`);
          urls.add(url);
        } else {
          console.log(`URL non valide ignorée: ${url}`);
        }
      }
      
      console.log(`URLs brutes trouvées: ${urls.size}`);
      return Array.from(urls);
    };
    
    const isValidCentrisUrl = (url: string) => {
      // Valider et filtrer pour les annonces immobilières
      const result = (
        url.includes("centris.ca") && 
        (url.includes("/fr/propriete/") || 
         url.includes("/en/property/") ||
         url.includes("/fr/maison~a-vendre/") ||
         url.includes("/en/house~for-sale/") ||
         url.includes("/fr/condo~a-vendre/") ||
         url.includes("/en/condo~for-sale/") ||
         url.includes("/fr/multi-logements~a-vendre/") || 
         url.includes("/en/multi-residential~for-sale/") ||
         url.includes("/fr/terre-terrain~a-vendre/") || 
         url.includes("/en/lot~for-sale/") ||
         url.includes("MLS=") || url.includes("Centris="))
      );
      
      console.log(`Validation URL ${url}: ${result ? 'VALIDE' : 'INVALIDE'}`);
      return result;
    };
    
    // Extraction des urls
    const centrisUrls = extractCentrisUrls(html);
    console.log(`URLs Centris filtrées: ${centrisUrls.length}`);
    
    if (centrisUrls.length === 0) {
      // Si aucune URL n'est trouvée, enregistrons une partie plus grande du HTML pour le débogage
      console.log("Aucune URL trouvée, voici un extrait plus large du HTML:");
      console.log(html.substring(0, 3000));
    }
    
    // Extraction des titres (approximatif)
    for (const url of centrisUrls) {
      // Essayer de trouver le titre associé à l'URL
      console.log(`Extraction du titre pour l'URL: ${url}`);
      const titleRegex = new RegExp(`<a[^>]*href="[^"]*${url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}[^"]*"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>`, 'i');
      const titleMatch = titleRegex.exec(html);
      let title = "Annonce Centris";
      
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/<[^>]*>/g, '');
        console.log(`Titre trouvé: ${title}`);
      } else {
        // Extraction fallback du titre à partir de l'URL
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && lastPart.length > 0) {
          title = lastPart.replace(/-/g, ' ').replace(/~[a-z-]+/g, '');
          title = title.charAt(0).toUpperCase() + title.slice(1);
          console.log(`Titre extrait de l'URL: ${title}`);
        } else {
          console.log(`Pas de titre trouvé, utilisation du titre par défaut: ${title}`);
        }
      }
      
      results.push({ url, title });
    }
    
    console.log(`Nombre de résultats trouvés: ${results.length}`);
    if (results.length > 0) {
      console.log("Premiers résultats:", JSON.stringify(results.slice(0, 3)));
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


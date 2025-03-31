import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractListingUrls, alternativeExtractListingUrls, extractAllPropertiesLink } from "./extractors/listing-extractor.ts";
import { extractTotalPages, hasNextPage, extractPropertyCount } from "./extractors/pagination-extractor.ts";
import { cleanBrokerUrl, validateBrokerUrl, isDirectPropertyListingUrl } from "./utils/url-utils.ts";
import { fetchWithRetry } from "./utils/request-utils.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brokerUrl, page = 1, lightMode = false } = await req.json();
    console.log('Scraping URL:', brokerUrl, 'Page:', page, 'Light mode:', lightMode);

    if (!validateBrokerUrl(brokerUrl)) {
      return new Response(
        JSON.stringify({ error: "L'URL doit provenir de centris.ca et être un profil de courtier ou une recherche de propriétés valide" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Determine if this is a direct property listing URL
    const isDirectSearch = isDirectPropertyListingUrl(brokerUrl);
    console.log(`URL type: ${isDirectSearch ? 'Direct property search' : 'Broker profile'}`);

    // Clean and normalize the URL
    const scrapingUrl = cleanBrokerUrl(brokerUrl, page);
    console.log('Processed URL for scraping:', scrapingUrl);
    
    let html: string;
    let fetchError = null;
    
    try {
      // Ajout d'un délai aléatoire pour simuler un comportement humain (entre 1 et 5 secondes)
      const randomDelay = 1000 + Math.floor(Math.random() * 4000);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
      
      // Améliorons les headers pour contourner les détections anti-bot
      const customHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.centris.ca/',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Cookie': 'TS01c02dd2=01bdefbe6ba9ecc7d50ba30dc15e3d4e24cf65fefb99bef8a6ad3e15e4b2ffb2'
      };
      
      const response = await fetchWithRetry(scrapingUrl, customHeaders, 4, 3000);
      html = response.html;
      
      // If there was an error but we still got HTML, record the error
      if (response.error) {
        fetchError = response.error;
        console.log('Fetch completed with error, but HTML was returned:', fetchError);
      } else {
        console.log('HTML successfully fetched, length:', html.length);
      }
    } catch (fetchCatastrophicError) {
      console.error('Network error fetching URL:', fetchCatastrophicError);
      return new Response(
        JSON.stringify({ 
          error: `Erreur réseau: ${fetchCatastrophicError instanceof Error ? fetchCatastrophicError.message : String(fetchCatastrophicError)}`,
          listingUrls: [],
          currentPage: page,
          hasNextPage: false,
          totalPages: 0
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    if (!html || html.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Réponse vide reçue du serveur", 
          listingUrls: [],
          currentPage: page,
          hasNextPage: false,
          totalPages: 0
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Extract property count to verify our extraction
    let displayedPropertyCount = extractPropertyCount(html);
    console.log('Initial property count:', displayedPropertyCount);
    
    // En mode léger, on cherche seulement les liens sans traitement complexe
    // De plus, on recherche plus intensément le lien "Voir toutes les propriétés"
    if (lightMode) {
      // Vérifier et extraire le lien "Voir toutes les propriétés" en priorité
      // C'est souvent plus fiable que d'essayer de parser les listings directement
      const hasViewAllPropertiesLink = html.includes('Voir toutes les propriétés') || 
                                  html.includes('See all properties') ||
                                  html.match(/voir\s+toutes\s+les\s+propri[ée]t[ée]s/i) ||
                                  html.includes('Voir toutes les propriétés du courtier');
      
      let allPropertiesUrl = null;
      if (hasViewAllPropertiesLink) {
        allPropertiesUrl = extractAllPropertiesLink(html);
        console.log('Found "Voir toutes les propriétés" URL:', allPropertiesUrl);
        
        if (allPropertiesUrl) {
          return new Response(
            JSON.stringify({
              hasAllPropertiesLink: true,
              allPropertiesUrl,
              listingUrls: [],
              currentPage: page,
              hasNextPage: false,
              totalPages: 0,
              lightMode: true
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
      }
      
      // Extract listing URLs in light mode - juste les liens
      let listingUrls = extractListingUrls(html);
      
      if (listingUrls.length === 0) {
        listingUrls = alternativeExtractListingUrls(html);
      }
      
      console.log(`Light mode: Found ${listingUrls.length} listing URLs`);
      
      // Save a portion of HTML for debugging if we couldn't find any listings
      let htmlExcerpt = null;
      if (listingUrls.length === 0) {
        htmlExcerpt = html.substring(0, 2000);
        console.log("HTML excerpt (first 2000 chars):", htmlExcerpt);
      }
      
      return new Response(
        JSON.stringify({
          listingUrls,
          currentPage: page,
          hasNextPage: false, // En mode léger, on ne cherche pas les pages suivantes
          totalPages: 1,
          hasAllPropertiesLink: hasViewAllPropertiesLink,
          allPropertiesUrl,
          lightMode: true,
          fetchError,
          htmlPreview: listingUrls.length === 0 ? htmlExcerpt : null
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Si on continue ici, on est en mode normal (complet)
    // If this is a direct property search, we don't need to look for "Voir toutes les propriétés"
    let hasViewAllPropertiesLink = false;
    let allPropertiesUrl = null;
    let allPropertiesHtml = html;
    
    if (!isDirectSearch) {
      // Only check for "Voir toutes les propriétés" if this is a broker profile
      hasViewAllPropertiesLink = html.includes('Voir toutes les propriétés') || 
                              html.includes('See all properties') ||
                              html.match(/voir\s+toutes\s+les\s+propri[ée]t[ée]s/i) ||
                              html.includes('Voir toutes les propriétés du courtier');
      
      // If we need to click "Voir toutes les propriétés", extract the correct URL
      if (hasViewAllPropertiesLink) {
        console.log('Detected "Voir toutes les propriétés" link - attempting to follow it');
        allPropertiesUrl = extractAllPropertiesLink(html);
        
        if (allPropertiesUrl) {
          console.log('Found "Voir toutes les propriétés" URL:', allPropertiesUrl);
          
          // Check if the original URL had the onlyonedisplay parameter and preserve it
          const preserveOnlyOneDisplay = brokerUrl.includes("onlyonedisplay=true");
          if (preserveOnlyOneDisplay && !allPropertiesUrl.includes("onlyonedisplay=true")) {
            allPropertiesUrl = `${allPropertiesUrl}${allPropertiesUrl.includes('?') ? '&' : '?'}onlyonedisplay=true`;
            console.log('Added onlyonedisplay parameter to URL:', allPropertiesUrl);
          }
          
          // Fetch the "Voir toutes les propriétées" page
          try {
            const { html: allPropertiesContent } = await fetchWithRetry(allPropertiesUrl, {}, 4, 3000);
            allPropertiesHtml = allPropertiesContent;
            console.log('All properties HTML fetched, length:', allPropertiesHtml.length);
            
            // Update property count
            const updatedPropertyCount = extractPropertyCount(allPropertiesHtml);
            if (updatedPropertyCount && updatedPropertyCount > 0) {
              console.log('Updated property count from all properties page:', updatedPropertyCount);
              displayedPropertyCount = updatedPropertyCount;
            }
          } catch (fetchError) {
            console.error('Error fetching all properties page:', fetchError);
            // Continue with the original HTML if fetch fails
            console.log('Continuing with original HTML');
          }
        } else {
          console.log('Could not find "Voir toutes les propriétés" link in the HTML');
        }
      } else {
        console.log('No "Voir toutes les propriétés" link detected - this profile shows listings directly');
      }
    }
    
    // Extract listing URLs from the page with multiple methods
    let listingUrls = extractListingUrls(allPropertiesHtml);
    console.log(`Primary extraction found ${listingUrls.length} listings`);
    
    // If we didn't find any listings, try an alternative parsing approach
    if (listingUrls.length === 0) {
      console.log('No listings found with primary extraction, trying fallback method');
      listingUrls = alternativeExtractListingUrls(allPropertiesHtml);
      console.log(`Alternative extraction found ${listingUrls.length} listings`);
    }
    
    console.log(`Total ${listingUrls.length} listings found on page ${page}`);
    
    // Check if there are more pages
    const hasMorePages = hasNextPage(allPropertiesHtml, page);
    const totalPages = extractTotalPages(allPropertiesHtml);
    console.log(`Pagination info: has next page: ${hasMorePages}, total pages: ${totalPages}`);
    
    // Calculate actual total properties if we have that info
    const totalProperties = displayedPropertyCount || 
                          (totalPages && listingUrls.length ? totalPages * listingUrls.length : listingUrls.length);
    
    // Determine if we should respond with a "special" redirect to the all properties URL
    if (!isDirectSearch && hasViewAllPropertiesLink && allPropertiesUrl && page === 1 && listingUrls.length === 0) {
      console.log('Returning all properties URL for client to retry with');
      return new Response(
        JSON.stringify({
          hasAllPropertiesLink: true,
          allPropertiesUrl: allPropertiesUrl,
          listingUrls: [],
          currentPage: page,
          hasNextPage: false,
          totalPages: 0,
          message: "Utilisez l'URL 'Voir toutes les propriétés' pour accéder aux annonces"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        listingUrls,
        currentPage: page,
        hasNextPage: hasMorePages,
        totalPages,
        totalListings: totalProperties,
        displayedPropertyCount,
        actualListingsFound: listingUrls.length,
        hasAllPropertiesLink: hasViewAllPropertiesLink,
        allPropertiesUrl: allPropertiesUrl,
        isDirectSearch
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error in scrape-broker-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Erreur dans la fonction: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        listingUrls: [],
        currentPage: 1,
        hasNextPage: false,
        totalPages: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

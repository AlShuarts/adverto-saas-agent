
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractListingUrls, alternativeExtractListingUrls, extractAllPropertiesLink } from "./extractors/listing-extractor.ts";
import { extractTotalPages, hasNextPage, extractPropertyCount } from "./extractors/pagination-extractor.ts";
import { cleanBrokerUrl, validateBrokerUrl } from "./utils/url-utils.ts";
import { corsHeaders, fetchWithRetry } from "./utils/request-utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brokerUrl, page = 1 } = await req.json();
    console.log('Scraping broker profile URL:', brokerUrl, 'Page:', page);

    if (!validateBrokerUrl(brokerUrl)) {
      return new Response(
        JSON.stringify({ error: "L'URL doit provenir de centris.ca et être un profil de courtier valide" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Clean and normalize the URL
    const scrapingUrl = cleanBrokerUrl(brokerUrl, page);
    console.log('Processed URL for scraping:', scrapingUrl);
    
    let html: string;
    try {
      const { html: fetchedHtml } = await fetchWithRetry(scrapingUrl, {}, 4, 3000);
      html = fetchedHtml;
      console.log('HTML successfully fetched, length:', html.length);
    } catch (fetchError) {
      console.error('Network error fetching broker profile:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: `Erreur réseau: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
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
    
    // Check if we're on a page that requires clicking "Voir toutes les propriétés"
    const hasViewAllPropertiesLink = html.includes('Voir toutes les propriétés') || 
                            html.includes('See all properties') ||
                            html.match(/voir\s+toutes\s+les\s+propri[ée]t[ée]s/i) ||
                            html.includes('Voir toutes les propriétés du courtier');
    
    // If we need to click "Voir toutes les propriétés", extract the correct URL
    let allPropertiesUrl = null;
    let allPropertiesHtml = html;
    
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
        
        // Fetch the "Voir toutes les propriétés" page
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
    
    // Extract listing URLs from the broker profile page with multiple methods
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
    if (hasViewAllPropertiesLink && allPropertiesUrl && page === 1 && listingUrls.length === 0) {
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
        allPropertiesUrl: allPropertiesUrl
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { scrapingHeaders } from "../scrape-centris/scraping-headers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brokerUrl, page = 1 } = await req.json();
    console.log('Scraping broker profile URL:', brokerUrl, 'Page:', page);

    if (!brokerUrl || !brokerUrl.includes("centris.ca")) {
      return new Response(
        JSON.stringify({ error: "L'URL doit provenir de centris.ca" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Make sure we're using the all properties view by modifying the URL
    let scrapingUrl = brokerUrl;
    
    // Remove any existing parameters that might conflict
    if (scrapingUrl.includes("?")) {
      const baseUrl = scrapingUrl.split("?")[0];
      const params = new URLSearchParams(scrapingUrl.split("?")[1]);
      
      // Keep only essential parameters
      const filteredParams = new URLSearchParams();
      if (params.has("view")) filteredParams.set("view", params.get("view") || "Summary");
      
      // Always ensure we're showing all properties
      filteredParams.set("uc", "0");
      
      scrapingUrl = baseUrl + "?" + filteredParams.toString();
    } else {
      scrapingUrl += "?uc=0";
    }
    
    // Ensure we're using the 'Summary' view
    if (!scrapingUrl.includes("view=")) {
      scrapingUrl += (scrapingUrl.includes("?") ? "&" : "?") + "view=Summary";
    }
    
    // Add page parameter for pagination
    if (page > 1) {
      scrapingUrl += (scrapingUrl.includes("?") ? "&" : "?") + `pn=${page}`;
    }

    console.log('Fetching URL:', scrapingUrl);
    try {
      const response = await fetch(scrapingUrl, { 
        headers: { 
          ...scrapingHeaders,
          // Add referrer to improve request legitimacy
          'Referer': 'https://www.centris.ca/',
        } 
      });
      
      if (!response.ok) {
        console.error('Failed to fetch broker profile:', response.status, response.statusText);
        throw new Error(`Failed to fetch broker profile: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      console.log('HTML length:', html.length);
      
      if (html.length === 0) {
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
      const propertyCountMatch = html.match(/(\d+)\s*(?:propriété|propriétés|property|properties)/i);
      let displayedPropertyCount = propertyCountMatch ? parseInt(propertyCountMatch[1], 10) : null;
      
      // Check if we're on a page that requires clicking "Voir toutes les propriétés"
      const needsToSeeAllProperties = html.includes('Voir toutes les propriétés') || 
                                      html.includes('See all properties') ||
                                      html.match(/voir\s+toutes\s+les\s+propri[ée]t[ée]s/i);
      
      // If we need to click "Voir toutes les propriétés", extract the correct URL
      let allPropertiesUrl = null;
      let allPropertiesHtml = html;
      
      if (needsToSeeAllProperties) {
        console.log('Detected "Voir toutes les propriétés" link');
        
        // Try to find the "Voir toutes les propriétés" link with various patterns
        const patterns = [
          /href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir toutes les propriétés|See all properties)/i,
          /href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés|See\s+all\s+properties)/i,
          /<a[^>]*href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés|See\s+all\s+properties)/i,
          /<a[^>]*href="([^"]+)"[^>]*class="[^"]*">(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés|See\s+all\s+properties)/i
        ];
        
        for (const pattern of patterns) {
          const allPropertiesMatch = html.match(pattern);
          if (allPropertiesMatch && allPropertiesMatch[1]) {
            allPropertiesUrl = allPropertiesMatch[1];
            break;
          }
        }
        
        if (!allPropertiesUrl) {
          // If we still couldn't find it, try a more generic approach
          const linkMatches = html.match(/<a[^>]*href="([^"]+)"[^>]*>/g);
          if (linkMatches) {
            for (const linkMatch of linkMatches) {
              if (linkMatch.toLowerCase().includes('voir') && linkMatch.toLowerCase().includes('propriété')) {
                const urlMatch = linkMatch.match(/href="([^"]+)"/i);
                if (urlMatch && urlMatch[1]) {
                  allPropertiesUrl = urlMatch[1];
                  break;
                }
              }
            }
          }
        }
        
        if (allPropertiesUrl) {
          console.log('Found "Voir toutes les propriétés" link:', allPropertiesUrl);
          
          // Make sure URL is absolute
          if (allPropertiesUrl.startsWith('/')) {
            allPropertiesUrl = `https://www.centris.ca${allPropertiesUrl}`;
          }
          
          // Make sure the URL has proper encoding
          try {
            allPropertiesUrl = new URL(allPropertiesUrl).toString();
          } catch (e) {
            console.error('Invalid URL:', allPropertiesUrl, e);
          }
          
          // Fetch the "Voir toutes les propriétés" page
          try {
            console.log('Fetching all properties page:', allPropertiesUrl);
            
            const allPropertiesResponse = await fetch(allPropertiesUrl, { 
              headers: { 
                ...scrapingHeaders,
                'Referer': scrapingUrl,
              } 
            });
            
            if (!allPropertiesResponse.ok) {
              console.error('Failed to fetch all properties page:', allPropertiesResponse.status, allPropertiesResponse.statusText);
            } else {
              allPropertiesHtml = await allPropertiesResponse.text();
              console.log('All properties HTML length:', allPropertiesHtml.length);
              
              // Update property count
              const updatedPropertyCountMatch = allPropertiesHtml.match(/(\d+)\s*(?:propriété|propriétés|property|properties)/i);
              if (updatedPropertyCountMatch) {
                console.log('Updated property count:', updatedPropertyCountMatch[1]);
                const updatedCount = parseInt(updatedPropertyCountMatch[1], 10);
                if (updatedCount > 0) {
                  displayedPropertyCount = updatedCount;
                }
              }
            }
          } catch (fetchError) {
            console.error('Error fetching all properties page:', fetchError);
            // Continue with the original HTML if fetch fails
          }
        } else {
          console.log('Could not find "Voir toutes les propriétés" link in the HTML');
        }
      }
      
      // Extract listing URLs from the broker profile page - improved to be more precise
      const listingUrls = extractListingUrls(allPropertiesHtml);
      console.log(`Found ${listingUrls.length} listings on page ${page}`);
      
      // Check if there are more pages by looking for pagination links
      const hasNextPage = allPropertiesHtml.includes('class="pager-next"') || allPropertiesHtml.includes('class="next"');
      const totalPages = extractTotalPages(allPropertiesHtml);
      
      // Calculate actual total properties if we have that info
      const totalProperties = displayedPropertyCount || 
                            (totalPages && listingUrls.length ? totalPages * listingUrls.length : listingUrls.length);
      
      return new Response(
        JSON.stringify({
          listingUrls,
          currentPage: page,
          hasNextPage,
          totalPages,
          totalListings: totalProperties,
          displayedPropertyCount,
          actualListingsFound: listingUrls.length,
          hasAllPropertiesLink: needsToSeeAllProperties,
          allPropertiesUrl: allPropertiesUrl
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } catch (fetchError) {
      console.error('Error during fetch operation:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: `Erreur lors de la récupération de la page: ${fetchError.message}`,
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
  } catch (error) {
    console.error('Error in scrape-broker-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Erreur dans la fonction: ${error.message}`,
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

function extractListingUrls(html: string): string[] {
  if (!html || typeof html !== 'string') {
    console.error('Invalid HTML received for extracting listing URLs');
    return [];
  }
  
  const listingUrls = new Set<string>();
  
  try {
    // More precise regex patterns to match property listings only - avoid menu items and other links
    const regexPatterns = [
      // Match listing detail URLs - more specific to actual property listings
      /href="(https:\/\/www\.centris\.ca\/fr\/(?:maison|condo|terrain|propriete)(?:~|\/)[^"]+\/[0-9]+)"(?![^<]*<\/a>[^<]*<\/li>[^<]*<\/ul>[^<]*<\/div>[^<]*<\/div>[^<]*<\/nav>)/g,
      /href="(\/fr\/(?:maison|condo|terrain|propriete)(?:~|\/)[^"]+\/[0-9]+)"(?![^<]*<\/a>[^<]*<\/li>[^<]*<\/ul>[^<]*<\/div>[^<]*<\/div>[^<]*<\/nav>)/g,
      // Match images with property links
      /<div\s+class="[^"]*thumbnail[^"]*"[^>]*>[\s\S]*?href="([^"]+)"[\s\S]*?<\/div>/gi,
      // More general patterns as fallbacks
      /href="((?:https:\/\/www\.centris\.ca)?\/fr\/[^"]*\/[0-9]+)"(?![^<]*<\/a>[^<]*<\/li>[^<]*<\/ul>[^<]*<\/div>[^<]*<\/div>[^<]*<\/nav>)/g,
      // Extract URLs from property-specific containers
      /<div\s+class="[^"]*property-thumbnail-item[^"]*"[^>]*>[\s\S]*?href="([^"]+)"[\s\S]*?<\/div>/gi,
      // Extract from detailed property cards (if they exist)
      /<div\s+class="[^"]*property-[^"]*"[^>]*>[\s\S]*?href="([^"]+)"[\s\S]*?<\/div>/gi
    ];
    
    for (const regex of regexPatterns) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        if (match && match[1]) {
          let url = match[1];
          
          // Convert relative URLs to absolute URLs
          if (url.startsWith('/')) {
            url = `https://www.centris.ca${url}`;
          }
          
          // Ensure we only add property listings with numeric IDs at the end
          if (/\/[0-9]+$/.test(url) && url.includes('/fr/')) {
            listingUrls.add(url);
          }
        }
      }
    }
    
    // If we still don't have any URLs, try an even more general approach
    if (listingUrls.size === 0) {
      // Look at all links and filter for property-like patterns
      const allLinksRegex = /href="([^"]+)"/gi;
      let match;
      while ((match = allLinksRegex.exec(html)) !== null) {
        if (match && match[1]) {
          let url = match[1];
          
          // Convert relative URLs to absolute URLs
          if (url.startsWith('/')) {
            url = `https://www.centris.ca${url}`;
          }
          
          // Filter to only include property listings
          if (url.includes('/fr/') && /\/[0-9]+$/.test(url)) {
            listingUrls.add(url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error while extracting listing URLs:', error);
  }
  
  return Array.from(listingUrls);
}

function extractTotalPages(html: string): number {
  if (!html || typeof html !== 'string') {
    return 1;
  }
  
  try {
    // Try to extract the total number of pages from pagination info
    const paginationRegex = /de\s+(\d+)\s+pages/i;
    const match = html.match(paginationRegex);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    // If we can't find pagination info, check if there are numbered page links
    const pageLinks = html.match(/class="page-link"[^>]*>(\d+)<\/a>/g);
    if (pageLinks && pageLinks.length > 0) {
      const pageNumbers = pageLinks.map(link => {
        const match = link.match(/>(\d+)</);
        return match ? parseInt(match[1], 10) : 0;
      });
      return Math.max(...pageNumbers);
    }
  } catch (error) {
    console.error('Error while extracting total pages:', error);
  }
  
  return 1; // Default to 1 if we can't determine the total pages
}

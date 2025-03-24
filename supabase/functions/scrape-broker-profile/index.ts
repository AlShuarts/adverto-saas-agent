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

    // Try to ensure we're using a clean, well-formed URL
    let scrapingUrl = brokerUrl;
    try {
      // For very complex URLs, use a more robust approach
      const urlObj = new URL(brokerUrl);
      const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
      
      // Reconstruct query params, removing any potentially problematic ones
      const params = new URLSearchParams();
      
      // Keep desired view type
      if (urlObj.searchParams.has("view")) {
        params.set("view", urlObj.searchParams.get("view") || "Summary");
      } else {
        params.set("view", "Summary");
      }
      
      // Show all properties
      params.set("uc", "0");
      
      // If we need pagination, add it
      if (page > 1) {
        params.set("pn", page.toString());
      }
      
      scrapingUrl = `${baseUrl}?${params.toString()}`;
      console.log('Cleaned URL:', scrapingUrl);
    } catch (urlError) {
      console.error('Error cleaning URL, using original:', urlError);
      
      // Fallback to basic URL modification if needed
      if (!scrapingUrl.includes("?")) {
        scrapingUrl += "?uc=0&view=Summary";
      } else if (!scrapingUrl.includes("uc=0")) {
        scrapingUrl += "&uc=0";
      }
      
      if (!scrapingUrl.includes("view=")) {
        scrapingUrl += "&view=Summary";
      }
      
      if (page > 1) {
        scrapingUrl += `&pn=${page}`;
      }
    }

    console.log('Fetching URL:', scrapingUrl);
    let response;
    
    try {
      response = await fetch(scrapingUrl, { 
        headers: { 
          ...scrapingHeaders,
          // Add referrer to improve request legitimacy
          'Referer': 'https://www.centris.ca/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow'
      });
    } catch (fetchError) {
      console.error('Network error fetching broker profile:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: `Erreur réseau: ${fetchError.message}`,
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
    
    if (!response || !response.ok) {
      console.error('Failed to fetch broker profile:', response?.status, response?.statusText);
      return new Response(
        JSON.stringify({ 
          error: `Échec de la récupération du profil: ${response?.status} ${response?.statusText}`,
          listingUrls: [],
          currentPage: page,
          hasNextPage: false,
          totalPages: 0
        }),
        { 
          status: response?.status || 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    let html;
    try {
      html = await response.text();
    } catch (textError) {
      console.error('Error reading response text:', textError);
      return new Response(
        JSON.stringify({ 
          error: `Erreur lors de la lecture de la réponse: ${textError.message}`,
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
    
    console.log('HTML length:', html?.length || 0);
    
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
      
      try {
        // Try to extract the URL using various methods
        // 1. Direct link extraction with multiple patterns
        const patterns = [
          /href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir toutes les propriétés|See all properties)/i,
          /href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés|See\s+all\s+properties)/i,
          /<a[^>]*href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés|See\s+all\s+properties)/i
        ];
        
        for (const pattern of patterns) {
          const allPropertiesMatch = html.match(pattern);
          if (allPropertiesMatch && allPropertiesMatch[1]) {
            allPropertiesUrl = allPropertiesMatch[1];
            console.log('Found URL with pattern match:', allPropertiesUrl);
            break;
          }
        }
        
        // 2. If direct patterns fail, try looking for any link with "voir" and "propriété"
        if (!allPropertiesUrl) {
          const linkMatches = html.match(/<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi);
          if (linkMatches) {
            for (const linkMatch of linkMatches) {
              const linkText = linkMatch.toLowerCase();
              if ((linkText.includes('voir') && linkText.includes('propriété')) || 
                  (linkText.includes('see') && linkText.includes('propert'))) {
                const urlMatch = linkMatch.match(/href="([^"]+)"/i);
                if (urlMatch && urlMatch[1]) {
                  allPropertiesUrl = urlMatch[1];
                  console.log('Found URL with keyword search:', allPropertiesUrl);
                  break;
                }
              }
            }
          }
        }
        
        // 3. Try to find a link by context
        if (!allPropertiesUrl) {
          // Look for links near text mentioning number of properties
          const countTextContext = html.match(/(\d+)\s*(?:propriété|propriétés|property|properties)[\s\S]{1,200}?<a[^>]*href="([^"]+)"/i);
          if (countTextContext && countTextContext[2]) {
            allPropertiesUrl = countTextContext[2];
            console.log('Found URL by property count context:', allPropertiesUrl);
          }
        }
        
        // Expand relative URLs
        if (allPropertiesUrl) {
          if (allPropertiesUrl.startsWith('/')) {
            allPropertiesUrl = `https://www.centris.ca${allPropertiesUrl}`;
          } else if (!allPropertiesUrl.startsWith('http')) {
            allPropertiesUrl = `https://www.centris.ca/${allPropertiesUrl}`;
          }
          
          // Ensure URL is properly encoded
          try {
            allPropertiesUrl = new URL(allPropertiesUrl).toString();
          } catch (e) {
            console.error('Invalid URL:', allPropertiesUrl, e);
          }
          
          console.log('Final "Voir toutes les propriétés" URL:', allPropertiesUrl);
          
          // Fetch the "Voir toutes les propriétés" page
          try {
            const allPropertiesResponse = await fetch(allPropertiesUrl, { 
              headers: { 
                ...scrapingHeaders,
                'Referer': scrapingUrl,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
              },
              redirect: 'follow'
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
      } catch (extractionError) {
        console.error('Error extracting "Voir toutes les propriétés" link:', extractionError);
      }
    }
    
    // Extract listing URLs from the broker profile page with multiple methods
    let listingUrls = extractListingUrls(allPropertiesHtml);
    
    // If we didn't find any listings, try an alternative parsing approach
    if (listingUrls.length === 0) {
      console.log('No listings found with primary extraction, trying fallback method');
      listingUrls = alternativeExtractListingUrls(allPropertiesHtml);
    }
    
    console.log(`Found ${listingUrls.length} listings on page ${page}`);
    
    // Check if there are more pages by looking for pagination links
    const hasNextPage = allPropertiesHtml.includes('class="pager-next"') || 
                        allPropertiesHtml.includes('class="next"') ||
                        allPropertiesHtml.includes('class="pagination-item_next"');
    
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
  } catch (error) {
    console.error('Error in scrape-broker-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: `Erreur dans la fonction: ${error.message || "Erreur inconnue"}`,
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
    // Primary extraction method - target property cards with most reliable selectors
    const propertyCardRegex = /<div\s+class="[^"]*(?:property-thumbnail-item|property|property-item)[^"]*"[^>]*>[\s\S]*?href="([^"]+)"[\s\S]*?<\/div>/gi;
    let match;
    while ((match = propertyCardRegex.exec(html)) !== null) {
      if (match && match[1]) {
        let url = match[1];
        // Convert relative URLs to absolute
        if (url.startsWith('/')) {
          url = `https://www.centris.ca${url}`;
        }
        
        // Only add valid listing URLs
        if ((url.includes('/fr/') || url.includes('/en/')) && 
            (url.includes('/maison/') || url.includes('/condo/') || 
             url.includes('/terrain/') || url.includes('/propriete/') ||
             url.includes('/house/') || url.includes('/lot/') || 
             url.includes('/property/')) && 
            /\/[0-9]+$/.test(url)) {
          listingUrls.add(url);
        }
      }
    }
    
    // Secondary method - find all listing links from <a> tags
    const regexPatterns = [
      // Match listing detail URLs with specific property types
      /href="((?:https:\/\/www\.centris\.ca)?\/fr\/(?:maison|condo|terrain|propriete)(?:~|\/)[^"]+\/[0-9]+)"/g,
      /href="((?:https:\/\/www\.centris\.ca)?\/en\/(?:house|condo|lot|property)(?:~|\/)[^"]+\/[0-9]+)"/g,
    ];
    
    for (const regex of regexPatterns) {
      while ((match = regex.exec(html)) !== null) {
        if (match && match[1]) {
          let url = match[1];
          if (url.startsWith('/')) {
            url = `https://www.centris.ca${url}`;
          }
          listingUrls.add(url);
        }
      }
    }
  } catch (error) {
    console.error('Error while extracting listing URLs:', error);
  }
  
  return Array.from(listingUrls);
}

function alternativeExtractListingUrls(html: string): string[] {
  if (!html || typeof html !== 'string') {
    return [];
  }
  
  const listingUrls = new Set<string>();
  
  try {
    // Extract all links from the page
    const allLinksRegex = /<a[^>]*href="([^"#]+)"[^>]*>/gi;
    let match;
    
    while ((match = allLinksRegex.exec(html)) !== null) {
      if (match && match[1]) {
        let url = match[1];
        
        // Convert relative URLs to absolute
        if (url.startsWith('/')) {
          url = `https://www.centris.ca${url}`;
        }
        
        // Filter to only include property listings with numeric IDs at the end
        // and proper language/property type paths
        if ((url.includes('/fr/') || url.includes('/en/')) && 
            (url.includes('/maison/') || url.includes('/condo/') || 
             url.includes('/terrain/') || url.includes('/propriete/') ||
             url.includes('/house/') || url.includes('/lot/') || 
             url.includes('/property/')) && 
            /\/[0-9]+$/.test(url)) {
          listingUrls.add(url);
        }
      }
    }
  } catch (error) {
    console.error('Error while extracting listing URLs (alternative method):', error);
  }
  
  return Array.from(listingUrls);
}

function extractTotalPages(html: string): number {
  if (!html || typeof html !== 'string') {
    return 1;
  }
  
  try {
    // Try multiple patterns to extract total pages
    
    // Pattern 1: "Page X de Y"
    const paginationRegex = /(?:Page|page)\s+\d+\s+(?:de|of|sur|on)\s+(\d+)/i;
    const match = html.match(paginationRegex);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    // Pattern 2: Look for highest numbered page link
    const pageLinks = html.match(/class="(?:page-link|pagination-item)[^"]*"[^>]*>(\d+)<\/a>/g);
    if (pageLinks && pageLinks.length > 0) {
      const pageNumbers = pageLinks.map(link => {
        const match = link.match(/>(\d+)</);
        return match ? parseInt(match[1], 10) : 0;
      });
      return Math.max(...pageNumbers);
    }
    
    // Pattern 3: Count pagination items
    const paginationItems = (html.match(/class="(?:page-item|pagination-item)"/g) || []).length;
    if (paginationItems > 0) {
      // Subtract items for prev/next buttons
      return Math.max(1, paginationItems - 2);
    }
  } catch (error) {
    console.error('Error while extracting total pages:', error);
  }
  
  return 1; // Default to 1 if we can't determine the total pages
}


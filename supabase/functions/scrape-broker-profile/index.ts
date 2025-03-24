
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

    // Ensure we're using the 'Summary' view and handling pagination if needed
    let scrapingUrl = brokerUrl;
    if (!scrapingUrl.includes("view=Summary")) {
      scrapingUrl += (scrapingUrl.includes("?") ? "&" : "?") + "view=Summary";
    }
    
    // Add page parameter for pagination
    if (page > 1) {
      scrapingUrl += (scrapingUrl.includes("?") ? "&" : "?") + `pn=${page}`;
    }

    console.log('Fetching URL:', scrapingUrl);
    const response = await fetch(scrapingUrl, { headers: scrapingHeaders });
    
    if (!response.ok) {
      console.error('Failed to fetch broker profile:', response.status, response.statusText);
      throw new Error('Failed to fetch broker profile');
    }

    const html = await response.text();
    console.log('HTML length:', html.length);
    
    // Extract property count to verify our extraction
    const propertyCountMatch = html.match(/(\d+)\s*(?:propriété|propriétés|property|properties)/i);
    const displayedPropertyCount = propertyCountMatch ? parseInt(propertyCountMatch[1], 10) : null;
    
    // Extract listing URLs from the broker profile page - improved to be more precise
    const listingUrls = extractListingUrls(html);
    console.log(`Found ${listingUrls.length} listings on page ${page}`);
    
    // Check if there are more pages by looking for pagination links
    const hasNextPage = html.includes('class="pager-next"') || html.includes('class="next"');
    const totalPages = extractTotalPages(html);
    
    // Calculate actual total properties if we have that info
    const totalProperties = displayedPropertyCount || 
                          (totalPages && listingUrls.length ? totalPages * listingUrls.length : listingUrls.length);
    
    return new Response(
      JSON.stringify({
        listingUrls,
        currentPage: page,
        hasNextPage,
        totalPages,
        totalListings: displayedPropertyCount || listingUrls.length,
        displayedPropertyCount,
        actualListingsFound: listingUrls.length
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

function extractListingUrls(html: string): string[] {
  const listingUrls = new Set<string>();
  
  // More precise regex to match property listings only - avoid menu items and other links
  const regexPatterns = [
    // Match listing detail URLs - more specific to actual property listings
    /href="(https:\/\/www\.centris\.ca\/fr\/(?:maison|condo|terrain|propriete)(?:~|\/)[^"]+\/[0-9]+)"(?![^<]*<\/a>[^<]*<\/li>[^<]*<\/ul>[^<]*<\/div>[^<]*<\/div>[^<]*<\/nav>)/g,
    /href="(\/fr\/(?:maison|condo|terrain|propriete)(?:~|\/)[^"]+\/[0-9]+)"(?![^<]*<\/a>[^<]*<\/li>[^<]*<\/ul>[^<]*<\/div>[^<]*<\/div>[^<]*<\/nav>)/g
  ];
  
  for (const regex of regexPatterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      let url = match[1];
      
      // Convert relative URLs to absolute URLs
      if (url.startsWith('/')) {
        url = `https://www.centris.ca${url}`;
      }
      
      // Ensure we only add property listings with numeric IDs at the end
      if (/\/[0-9]+$/.test(url)) {
        listingUrls.add(url);
      }
    }
  }
  
  return Array.from(listingUrls);
}

function extractTotalPages(html: string): number {
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
  
  return 1; // Default to 1 if we can't determine the total pages
}


/**
 * Utility functions to extract listing URLs from Centris search results
 */

/**
 * Primary extraction method for listing URLs
 * Targets property cards with most reliable selectors
 */
export function extractListingUrls(html: string): string[] {
  if (!html || typeof html !== 'string') {
    console.error('Invalid HTML received for extracting listing URLs');
    return [];
  }
  
  const listingUrls = new Set<string>();
  const listingData = [];
  
  try {
    // Multiple extraction methods for redundancy
    
    // Method 1: Extract using property-row pattern (shown in the user's screenshot)
    const propertyRowRegex = /<div\s+class="(?:[^"]*\s)?property-row(?:\s[^"]*)?">[\s\S]*?<\/div>/gi;
    const propertyRows = html.match(propertyRowRegex);
    
    if (propertyRows && propertyRows.length > 0) {
      console.log(`Found ${propertyRows.length} property rows with class="property-row"`);
      
      for (const row of propertyRows) {
        // Extract the property URL
        const urlMatch = row.match(/href="([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
          let url = urlMatch[1];
          url = normalizeUrl(url);
          
          if (isValidListingUrl(url)) {
            listingUrls.add(url);
            
            // Extract additional data for debugging
            try {
              const centrisIdMatch = url.match(/\/([0-9]+)$/);
              const centrisId = centrisIdMatch ? centrisIdMatch[1] : null;
              
              const imgMatch = row.match(/<img[^>]*src="([^"]+)"/);
              const imgUrl = imgMatch ? imgMatch[1] : null;
              
              const titleMatch = row.match(/<meta[^>]*itemprop="name"[^>]*content="([^"]+)"/);
              const title = titleMatch ? titleMatch[1] : null;
              
              listingData.push({
                url,
                centrisId,
                imgUrl,
                title
              });
            } catch (e) {
              console.error('Error extracting additional data:', e);
            }
          }
        }
      }
      
      console.log('Extracted listing data:', JSON.stringify(listingData.slice(0, 3)));
    } else {
      console.log('No property rows found using property-row pattern');
    }
    
    // Method 2: Extract using property-thumbnail pattern
    const propertyCardPatterns = [
      /<div\s+class="[^"]*(?:property-thumbnail-item|property|property-item)[^"]*"[^>]*>[\s\S]*?href="([^"]+)"[\s\S]*?<\/div>/gi,
      /<a\s+class="[^"]*(?:property-thumbnail-link|property-link)[^"]*"[^>]*href="([^"]+)"[^>]*>/gi,
      /<div\s+class="[^"]*thumbnail[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi,
      /<div\s+class="property-thumbnail-summary"[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi
    ];
    
    for (const pattern of propertyCardPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match && match[1]) {
          let url = match[1];
          url = normalizeUrl(url);
          
          // Only add valid listing URLs
          if (isValidListingUrl(url)) {
            listingUrls.add(url);
          }
        }
      }
    }
    
    // Method 3: Find links directly in the document
    const linkPatterns = [
      // French property types
      /href="((?:https:\/\/www\.centris\.ca)?\/fr\/(?:maison|condo|terrain|propriete|ferme|commerce|multiplex)(?:~|\/)[^"]+\/[0-9]+)"/g,
      // English property types
      /href="((?:https:\/\/www\.centris\.ca)?\/en\/(?:house|condo|lot|property|farm|commercial|multiplex|plex)(?:~|\/)[^"]+\/[0-9]+)"/g,
    ];
    
    for (const pattern of linkPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match && match[1]) {
          let url = match[1];
          url = normalizeUrl(url);
          
          if (isValidListingUrl(url)) {
            listingUrls.add(url);
          }
        }
      }
    }
    
    // Method 4: Scan all links with property IDs at the end
    const allLinksRegex = /<a[^>]*href="([^"#]+)"[^>]*>/gi;
    let match;
    while ((match = allLinksRegex.exec(html)) !== null) {
      if (match && match[1]) {
        let url = match[1];
        url = normalizeUrl(url);
        
        if (isValidListingUrl(url)) {
          listingUrls.add(url);
        }
      }
    }
    
    // Method 5: Try to find meta tags with property info
    const metaTagRegex = /<meta[^>]*itemprop="name"[^>]*content="([^"]+)"[^>]*>/gi;
    const metaTags = [];
    while ((match = metaTagRegex.exec(html)) !== null) {
      if (match && match[1]) {
        metaTags.push(match[1]);
      }
    }
    if (metaTags.length > 0) {
      console.log(`Found ${metaTags.length} meta tags with property names`);
    }
    
    console.log(`Total unique listing URLs found: ${listingUrls.size}`);
  } catch (error) {
    console.error('Error while extracting listing URLs:', error);
  }
  
  return Array.from(listingUrls);
}

/**
 * Alternative extraction method for listing URLs
 * Used as a fallback when primary method finds no listings
 */
export function alternativeExtractListingUrls(html: string): string[] {
  if (!html || typeof html !== 'string') {
    return [];
  }
  
  const listingUrls = new Set<string>();
  
  try {
    // Try to find property elements with different patterns
    const patterns = [
      // Look for data attributes that might contain property IDs
      /<div[^>]*data-id="([^"]+)"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi,
      // Look for media elements that often contain property images and links
      /<div[^>]*class="[^"]*media[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi,
      // Look for anchor tags with specific classes
      /<a[^>]*class="[^"]*(?:property|listing)[^"]*"[^>]*href="([^"]+)"[^>]*>/gi,
      // Look for specific div with listing information
      /<div class="property-thumbnail-summary"[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi,
      // Look for any button that might link to a property
      /<button[^>]*data-url="([^"]+)"[^>]*>/gi,
      // Look for specific property row structure (from user screenshot)
      /<div[^>]*class="[^"]*property-row[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi,
      // Look for meta tags with property info
      /<meta[^>]*itemprop="name"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        // If the pattern has captured groups, use the last one (the URL)
        const url = match[match.length - 1];
        if (url) {
          const normalizedUrl = normalizeUrl(url);
          if (isValidListingUrl(normalizedUrl)) {
            listingUrls.add(normalizedUrl);
          }
        }
      }
    }
    
    // If we still haven't found anything, try an extreme approach by looking
    // for any URL that ends with a number (potential listing ID)
    if (listingUrls.size === 0) {
      const extreme = html.match(/href="([^"]+\/[0-9]+)"/g);
      if (extreme) {
        for (const potentialUrl of extreme) {
          const url = potentialUrl.replace(/^href="/, '').replace(/"$/, '');
          const normalizedUrl = normalizeUrl(url);
          if (isValidListingUrl(normalizedUrl)) {
            listingUrls.add(normalizedUrl);
          }
        }
      }
    }
    
    // Debug raw HTML if we still can't find anything
    if (listingUrls.size === 0) {
      // Log a piece of the HTML for debugging
      const htmlExcerpt = html.substring(0, 1000);
      console.log('HTML excerpt for debugging:', htmlExcerpt);
      
      // Try to find any numbers that might be Centris IDs
      const potentialIds = html.match(/\b\d{8}\b/g);
      if (potentialIds && potentialIds.length > 0) {
        console.log('Potential Centris IDs found:', potentialIds);
      }
    }
  } catch (error) {
    console.error('Error while extracting listing URLs (alternative method):', error);
  }
  
  return Array.from(listingUrls);
}

/**
 * Check if a URL is a valid Centris listing URL
 */
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

/**
 * Normalize a URL to ensure it's properly formed
 */
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

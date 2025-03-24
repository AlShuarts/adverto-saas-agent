
/**
 * Utility functions to extract listing URLs from Centris broker profile pages
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

/**
 * Extract the "Voir toutes les propriétés" link from the HTML
 */
export function extractAllPropertiesLink(html: string): string | null {
  if (!html || typeof html !== 'string') {
    return null;
  }
  
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
        let url = allPropertiesMatch[1];
        url = normalizeUrl(url);
        console.log('Found URL with pattern match:', url);
        return url;
      }
    }
    
    // 2. If direct patterns fail, try looking for any link with "voir" and "propriété"
    const linkMatches = html.match(/<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi);
    if (linkMatches) {
      for (const linkMatch of linkMatches) {
        const linkText = linkMatch.toLowerCase();
        if ((linkText.includes('voir') && linkText.includes('propriété')) || 
            (linkText.includes('see') && linkText.includes('propert'))) {
          const urlMatch = linkMatch.match(/href="([^"]+)"/i);
          if (urlMatch && urlMatch[1]) {
            let url = urlMatch[1];
            url = normalizeUrl(url);
            console.log('Found URL with keyword search:', url);
            return url;
          }
        }
      }
    }
    
    // 3. Try to find a link by context
    // Look for links near text mentioning number of properties
    const countTextContext = html.match(/(\d+)\s*(?:propriété|propriétés|property|properties)[\s\S]{1,200}?<a[^>]*href="([^"]+)"/i);
    if (countTextContext && countTextContext[2]) {
      let url = countTextContext[2];
      url = normalizeUrl(url);
      console.log('Found URL by property count context:', url);
      return url;
    }
  } catch (extractionError) {
    console.error('Error extracting "Voir toutes les propriétés" link:', extractionError);
  }
  
  return null;
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

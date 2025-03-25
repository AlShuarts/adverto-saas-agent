
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
    // Multiple extraction methods for redundancy
    
    // Method 1: Extract from property cards
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
    
    // Method 2: Find links directly in the document
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
    
    // Method 3: Scan all links with property IDs at the end
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
      /<button[^>]*data-url="([^"]+)"[^>]*>/gi
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
    
    // 1. Look for the exact text "Voir toutes les propriétés" or "See all properties"
    const textPatterns = [
      /href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir toutes les propriétés|See all properties)/i,
      /href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés|See\s+all\s+properties)/i,
      /<a[^>]*href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés|See\s+all\s+properties)/i,
      /<a[^>]*href="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir\s+toutes\s+les\s+propriétés\s+du\s+courtier|See\s+all\s+broker\s+properties)/i
    ];
    
    for (const pattern of textPatterns) {
      const allPropertiesMatch = html.match(pattern);
      if (allPropertiesMatch && allPropertiesMatch[1]) {
        let url = allPropertiesMatch[1];
        url = normalizeUrl(url);
        console.log('Found URL with pattern match:', url);
        return url;
      }
    }
    
    // 2. Look for buttons or links with specific classes that might be "see all" buttons
    const classPatterns = [
      /<a[^>]*class="[^"]*(?:btn-view-all|view-all|see-all|voir-tout)[^"]*"[^>]*href="([^"]+)"[^>]*>/i,
      /<button[^>]*data-url="([^"]+)"[^>]*>(?:\s*<[^>]+>\s*)*(?:Voir|See)/i,
      /<a[^>]*href="([^"]+)"[^>]*class="[^"]*linkViewAllProperties[^"]*"/i
    ];
    
    for (const pattern of classPatterns) {
      const buttonMatch = html.match(pattern);
      if (buttonMatch && buttonMatch[1]) {
        let url = buttonMatch[1];
        url = normalizeUrl(url);
        console.log('Found URL with class pattern match:', url);
        return url;
      }
    }
    
    // 3. If direct patterns fail, try looking for any link with "voir" and "propriété"
    const linkMatches = html.match(/<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi);
    if (linkMatches) {
      for (const linkMatch of linkMatches) {
        const linkText = linkMatch.toLowerCase();
        if ((linkText.includes('voir') && (linkText.includes('propriété') || linkText.includes('propriete'))) || 
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
    
    // 4. Try extracting broker ID and constructing a direct URL
    const brokerIdMatch = html.match(/\/courtier-immobilier~([^~\/]+)~/) || html.match(/\/([D][0-9]+)[\?\/]/);
    if (brokerIdMatch && brokerIdMatch[1]) {
      const brokerId = brokerIdMatch[1];
      const allPropertiesUrl = `https://www.centris.ca/fr/courtier-immobilier~${brokerId}?view=Summary&uc=0`;
      console.log('Constructed URL from broker ID:', allPropertiesUrl);
      return allPropertiesUrl;
    }
  } catch (extractionError) {
    console.error('Error extracting "Voir toutes les propriétés" link:', extractionError);
  }
  
  return null;
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


/**
 * Improved validation for broker URLs that handles both regular profiles, "all properties" views, and direct property searches
 */
export const validateBrokerUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL provided:', url);
    return false;
  }

  try {
    // Create URL object to validate the URL format first
    new URL(url);
    
    // Check if URL is from centris.ca
    if (!url.includes('centris.ca')) {
      console.error('Not a Centris URL:', url);
      return false;
    }
    
    // Multiple valid patterns
    const validPatterns = [
      // Broker profile patterns
      /courtier-immobilier/i,        // Regular broker profile
      /real-estate-broker/i,         // English version
      /mes-inscriptions/i,           // "Mes inscriptions" view
      /my-listings/i,                // English "My listings" view
      /search\.aspx.*&bsc=\d+/i,     // Search with broker ID (bsc parameter)
      /Residential.*AgentId=/i,      // Another format with AgentId
      
      // Direct property listing patterns
      /propriete~a-vendre/i,         // French property listings
      /property~for-sale/i,          // English property listings
      /uc=\d+/i,                     // URL containing broker ID as "uc" parameter
    ];
    
    // Check if any pattern matches
    const isValid = validPatterns.some(pattern => pattern.test(url));
    
    if (!isValid) {
      console.error('URL does not match any known broker profile or property listing patterns:', url);
    }
    
    return isValid;
  } catch (error) {
    console.error('URL validation error:', error);
    return false;
  }
};

/**
 * Enhanced URL cleaner with better preservation of important parameters
 */
export const cleanBrokerUrl = (brokerUrl: string, page: number = 1): string => {
  if (!brokerUrl || typeof brokerUrl !== 'string') {
    console.error('Invalid URL provided to cleanBrokerUrl:', brokerUrl);
    return '';
  }

  try {
    // Log original URL for debugging
    console.log("Original broker URL:", brokerUrl);
    
    // Create a URL object to work with
    const urlObj = new URL(brokerUrl);
    
    // IMPORTANT: DON'T MODIFY THE CORE URL PATH
    // Only adjust query parameters as needed

    // If this is a direct property listing URL, ensure it has the correct parameters
    if (brokerUrl.includes("propriete~a-vendre") || brokerUrl.includes("property~for-sale")) {
      // Ensure we're showing all listings per page
      if (!urlObj.searchParams.has("ps")) {
        urlObj.searchParams.set("ps", "40"); // Set to maximum page size
      }
      
      // Make sure the view is set to thumbnail for easier parsing
      if (!urlObj.searchParams.has("view")) {
        urlObj.searchParams.set("view", "Thumbnail");
      }
    } else {
      // For regular broker profiles, ensure essential view parameter exists
      if (!urlObj.searchParams.has("view")) {
        urlObj.searchParams.set("view", "Summary");
      }
    }
    
    // Preserve "onlyonedisplay" parameter if it exists
    const hasOnlyOneDisplay = brokerUrl.includes("onlyonedisplay=true");
    if (hasOnlyOneDisplay && !urlObj.searchParams.has("onlyonedisplay")) {
      urlObj.searchParams.set("onlyonedisplay", "true");
    }
    
    // Handle pagination
    if (page > 1) {
      urlObj.searchParams.set("pn", page.toString());
    }
    
    // Preserve all other parameters that might be important
    // Specifically ensure we're keeping the broker ID parameters
    // like 'uc', 'bsc', 'AgentId' intact
    
    console.log(`Processed URL: ${urlObj.toString()}`);
    return urlObj.toString();
  } catch (error) {
    console.error('Error processing URL:', error);
    return brokerUrl; // Return original URL on error rather than failing
  }
};

/**
 * Determine if a URL is a direct property listing URL rather than a broker profile
 */
export const isDirectPropertyListingUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return (
    url.includes("propriete~a-vendre") || 
    url.includes("property~for-sale") || 
    (url.includes("uc=") && !url.includes("courtier-immobilier"))
  );
};

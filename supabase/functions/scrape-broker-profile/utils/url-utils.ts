
/**
 * Utility functions for handling URLs
 */

/**
 * Clean and normalize a broker profile URL
 */
export function cleanBrokerUrl(brokerUrl: string, page: number = 1): string {
  if (!brokerUrl || !brokerUrl.includes("centris.ca")) {
    throw new Error("L'URL doit provenir de centris.ca");
  }

  try {
    // For URLs containing "onlyonedisplay=true", we need to be more careful
    // and preserve most of the original URL structure
    if (brokerUrl.includes("onlyonedisplay=true")) {
      console.log("Detected 'onlyonedisplay=true' parameter - preserving original URL structure");
      
      // Create a URL object to work with
      const urlObj = new URL(brokerUrl);
      
      // Set essential parameters
      if (!urlObj.searchParams.has("view")) {
        urlObj.searchParams.set("view", "Summary");
      }
      
      // Change uc to 0 to show all properties
      urlObj.searchParams.set("uc", "0");
      
      // Handle pagination
      if (page > 1) {
        urlObj.searchParams.set("pn", page.toString());
      }
      
      // Preserve other parameters but make sure essential ones are set correctly
      console.log(`Preserved broker URL: ${urlObj.toString()}`);
      return urlObj.toString();
    }
    
    // For very complex URLs, use a more robust approach
    const urlObj = new URL(brokerUrl);
    const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
    
    // Reconstruct query params, only keeping essential ones
    const params = new URLSearchParams();
    
    // Keep the view parameter (or set to Summary by default)
    if (urlObj.searchParams.has("view")) {
      params.set("view", urlObj.searchParams.get("view") || "Summary");
    } else {
      params.set("view", "Summary");
    }
    
    // Always set uc=0 to show all properties
    params.set("uc", "0");
    
    // Handle pagination
    if (page > 1) {
      params.set("pn", page.toString());
    }
    
    // Important: Add the broker ID if it exists in the pathname
    const brokerIdMatch = urlObj.pathname.match(/\/D(\d+)/);
    if (brokerIdMatch && brokerIdMatch[1]) {
      // This ensures we keep the broker identifier
      params.set("broker", brokerIdMatch[1]);
    }
    
    return `${baseUrl}?${params.toString()}`;
  } catch (urlError) {
    console.error('Error parsing URL with new URL():', urlError);
    
    // If URL parsing fails, try a more basic approach
    // Extract the base URL without query parameters
    const baseUrlMatch = brokerUrl.match(/(https?:\/\/[^?]+)/);
    const baseUrl = baseUrlMatch ? baseUrlMatch[1] : brokerUrl;
    
    // Create minimal query parameters
    const params = new URLSearchParams();
    params.set("view", "Summary");
    params.set("uc", "0");
    
    if (page > 1) {
      params.set("pn", page.toString());
    }
    
    // Extract broker ID if possible
    const brokerIdMatch = brokerUrl.match(/\/D(\d+)/);
    if (brokerIdMatch && brokerIdMatch[1]) {
      params.set("broker", brokerIdMatch[1]);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }
}

/**
 * Validates if the URL is a valid Centris broker profile URL
 */
export function validateBrokerUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Check if it's a Centris URL
  if (!url.includes("centris.ca")) {
    return false;
  }
  
  // Check if it's a broker profile URL (contains /courtier-immobilier or /broker or D{number})
  if (url.includes("/courtier-immobilier") || 
      url.includes("/broker") || 
      url.match(/\/D\d+/) !== null) {
    return true;
  }
  
  return false;
}

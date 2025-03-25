
/**
 * Validate if the URL is a valid Centris broker profile URL
 */
export const validateBrokerUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL provided:', url);
    return false;
  }

  // Check if URL is from centris.ca and contains courtier-immobilier
  return url.includes('centris.ca') && 
         (url.includes('courtier-immobilier') || 
          url.includes('real-estate-broker'));
};

/**
 * Clean and normalize broker URL for proper scraping
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

    // Ensure essential view parameter exists
    if (!urlObj.searchParams.has("view")) {
      urlObj.searchParams.set("view", "Summary");
    }
    
    // Handle pagination
    if (page > 1) {
      urlObj.searchParams.set("pn", page.toString());
    }
    
    // Preserve all other parameters exactly as they were
    console.log(`Preserved broker URL: ${urlObj.toString()}`);
    return urlObj.toString();
  } catch (error) {
    console.error('Error processing broker URL:', error);
    return brokerUrl; // Return original URL on error rather than failing
  }
};

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
    
    return `${baseUrl}?${params.toString()}`;
  } catch (urlError) {
    console.error('Error cleaning URL, using original:', urlError);
    
    // Fallback to basic URL modification if needed
    let cleanUrl = brokerUrl;
    
    if (!cleanUrl.includes("?")) {
      cleanUrl += "?uc=0&view=Summary";
    } else if (!cleanUrl.includes("uc=0")) {
      cleanUrl += "&uc=0";
    }
    
    if (!cleanUrl.includes("view=")) {
      cleanUrl += "&view=Summary";
    }
    
    if (page > 1) {
      cleanUrl += `&pn=${page}`;
    }
    
    return cleanUrl;
  }
}

/**
 * Validates if the URL is a valid Centris broker profile URL
 */
export function validateBrokerUrl(url: string): boolean {
  return !!url && url.includes("centris.ca");
}

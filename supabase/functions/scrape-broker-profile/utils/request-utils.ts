
/**
 * Utility functions for handling HTTP requests
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Headers to use for scraping Centris
 */
export const scrapingHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

/**
 * Fetch a URL with retry logic
 */
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries = 3, 
  retryDelay = 2000
): Promise<{ html: string; status: number }> {
  let lastError: Error | null = null;
  
  // Apply default headers if none provided
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...scrapingHeaders,
      ...(options.headers || {}),
    },
  };
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching URL (attempt ${attempt}/${maxRetries}): ${url}`);
      
      const response = await fetch(url, fetchOptions);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      if (!html || html.length === 0) {
        throw new Error('Empty response body');
      }
      
      if (html.includes('Access Denied') || html.includes('Forbidden') || html.includes('captcha')) {
        throw new Error('Access denied, forbidden, or captcha encountered');
      }
      
      console.log(`Successfully fetched HTML (${html.length} bytes)`);
      return { html, status: response.status };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Fetch attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        // Calculate delay with exponential backoff
        const delay = retryDelay * Math.pow(1.5, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple attempts');
}

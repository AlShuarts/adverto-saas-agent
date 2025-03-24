
/**
 * Utility functions for making HTTP requests
 */

/**
 * Headers to use for scraping requests to appear more like a browser
 */
export const scrapingHeaders = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
  'Referer': 'https://www.centris.ca/',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

/**
 * CORS headers for API responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Fetch HTML from a URL with retry logic
 */
export async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<{html: string, response: Response}> {
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, { 
        headers: scrapingHeaders,
        redirect: 'follow'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      if (!html || html.length === 0) {
        throw new Error("Empty response received");
      }
      
      return { html, response };
    } catch (error) {
      retries++;
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Retry ${retries}/${maxRetries} after error:`, lastError.message);
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw lastError || new Error("Failed to fetch after multiple retries");
}

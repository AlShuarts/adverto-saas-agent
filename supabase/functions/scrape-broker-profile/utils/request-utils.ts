
/**
 * Common browser-like headers and utilities for making HTTP requests
 */

import { corsHeaders } from "../../_shared/cors.ts";

/**
 * Common browser-like headers to use for scraping
 */
export const scrapingHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
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
 * Helper for simulating human-like delay between requests
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Improved fetch with retry logic and detailed error handling
 */
export async function fetchWithRetry(url: string, options = {}, maxRetries = 4, delayMs = 3000) {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt} for URL: ${url}`);
      
      // Add randomization to delay to appear more human-like
      if (attempt > 1) {
        const jitter = Math.floor(Math.random() * 1000);
        await sleep(delayMs + jitter);
      }
      
      // Combine default scraping headers with any passed options
      const fetchOptions = {
        headers: { ...scrapingHeaders },
        ...options,
      };
      
      // Make the request
      const response = await fetch(url, fetchOptions);
      
      console.log(`Fetch attempt ${attempt} status: ${response.status}`);
      
      // Check if we got blocked or received a CAPTCHA
      if (response.status === 403 || 
          response.status === 429 || 
          (await response.text()).toLowerCase().includes('captcha')) {
        throw new Error(`Access denied, forbidden, or captcha encountered`);
      }
      
      // For other unsuccessful responses
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      // Successful response - get the HTML
      const html = await response.text();
      
      // Additional verification to catch CAPTCHAs in successful responses
      if (html.toLowerCase().includes('captcha') || 
          html.toLowerCase().includes('access denied') ||
          html.toLowerCase().includes('robot') && html.toLowerCase().includes('detect')) {
        throw new Error(`CAPTCHA or access restriction in response body`);
      }
      
      return { 
        html,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Fetch attempt ${attempt} failed: ${lastError.message}`);
      
      // If this was our last attempt, we'll throw the error after the loop
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} fetch attempts failed for URL: ${url}`);
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error(`All ${maxRetries} fetch attempts failed for unknown reasons`);
}

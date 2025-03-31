/**
 * Common browser-like headers and utilities for making HTTP requests
 */

import { corsHeaders } from "../../_shared/cors.ts";

// Array of different user agents for rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Get a random user agent from the array
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Common browser-like headers to use for scraping
 */
export const scrapingHeaders = {
  'User-Agent': getRandomUserAgent(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Referer': 'https://www.centris.ca/',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
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
export async function fetchWithRetry(url: string, customHeaders = {}, maxRetries = 4, delayMs = 3000) {
  let lastError: Error | null = null;
  let rawHtml = "";
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt} for URL: ${url}`);
      
      // Add randomization to delay to appear more human-like
      if (attempt > 1) {
        const jitter = Math.floor(Math.random() * 3000); // More random delay
        await sleep(delayMs + jitter);
      }
      
      // Get a fresh user agent for each attempt
      const userAgent = getRandomUserAgent();
      
      // Combine default scraping headers with any passed headers
      const fetchOptions = {
        headers: { 
          ...scrapingHeaders,
          'User-Agent': userAgent,
          ...customHeaders 
        },
      };
      
      // Log the user agent being used
      console.log(`Using User-Agent: ${userAgent}`);
      
      // Make the request
      const response = await fetch(url, fetchOptions);
      
      console.log(`Fetch attempt ${attempt} status: ${response.status}`);
      
      // Get the HTML before checking for access denied
      const html = await response.text();
      rawHtml = html;
      
      // Save raw HTML for detailed error analysis
      if (attempt === maxRetries && !response.ok) {
        // Log a portion of the response for debugging
        console.log("HTML response preview (first 500 chars):", html.substring(0, 500));
      }
      
      // Check for captcha or access denied in the HTML
      if (
        html.toLowerCase().includes('captcha') || 
        html.toLowerCase().includes('access denied') ||
        html.toLowerCase().includes('robot') && html.toLowerCase().includes('detect') ||
        html.toLowerCase().includes('suspicious activity')
      ) {
        throw new Error(`Access denied, forbidden, or captcha encountered`);
      }
      
      // For other unsuccessful responses
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
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
        // Return the raw HTML we got, even if it contains an error page
        // This allows us to analyze what went wrong and possibly extract partial data
        if (rawHtml) {
          console.log(`Returning raw HTML from failed request (length: ${rawHtml.length})`);
          return {
            html: rawHtml,
            status: 200, // Fake success status
            headers: {},
            error: lastError.message
          };
        }
      }
    }
  }
  
  // If we get here and have raw HTML, return it for analysis
  if (rawHtml) {
    return {
      html: rawHtml,
      status: 200, // Fake success status
      headers: {},
      error: lastError ? lastError.message : "Unknown error"
    };
  }
  
  // Otherwise, throw the error
  throw lastError || new Error(`All ${maxRetries} fetch attempts failed for unknown reasons`);
}

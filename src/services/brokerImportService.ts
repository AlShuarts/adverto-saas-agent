
import { supabase } from "@/integrations/supabase/client";
import { importCentrisListing } from "./centrisImportService";

type ProgressUpdateCallback = (
  imported: number,
  total: number,
  failed: number
) => void;

export async function importListingsFromBrokerProfile(
  brokerUrl: string,
  userId: string,
  onProgressUpdate?: ProgressUpdateCallback
) {
  let hasTriedAllPropertiesUrl = false;

  try {
    // Statistics tracking
    const stats = {
      imported: 0,
      total: 0,
      failed: 0,
      failedUrls: []
    };

    // Log the original broker URL to help with debugging
    console.log(`Original URL: ${brokerUrl}`);

    // Initialize with first page
    let currentPage = 1;
    let hasNextPage = true;
    let totalPages = 1;

    // Process all pages of listings
    while (hasNextPage) {
      console.log(`Processing page ${currentPage}`);
      
      if (onProgressUpdate) {
        onProgressUpdate(stats.imported, stats.total, stats.failed);
      }

      // Call the Supabase Edge Function to scrape broker profile
      const { data: response, error } = await supabase.functions.invoke(
        "scrape-broker-profile",
        {
          body: {
            brokerUrl,
            page: currentPage,
          },
        }
      );

      // Handle errors
      if (error) {
        console.error(`Error scraping page ${currentPage}:`, error);
        throw new Error(`Erreur lors de l'extraction: ${error.message}`);
      }

      // If we received a partial response with error details
      if (response.error) {
        console.error(`API reported error on page ${currentPage}:`, response.error);
        
        // If this is the last page or a critical error, throw
        if (currentPage > 1 || response.error.includes("Access Denied")) {
          throw new Error(`Erreur lors de l'extraction: ${response.error}`);
        }
        
        // Otherwise, we might still have some data, so continue
      }

      // Handle special case: "Voir toutes les propriétés" link
      if (
        response.hasAllPropertiesLink && 
        response.allPropertiesUrl && 
        !hasTriedAllPropertiesUrl
      ) {
        console.log(
          "Found 'Voir toutes les propriétés' link. Redirecting to all properties page:", 
          response.allPropertiesUrl
        );
        
        // Set the flag to avoid infinite loops
        hasTriedAllPropertiesUrl = true;
        
        // Preserve any "onlyonedisplay=true" parameter if present
        const finalUrl = brokerUrl.includes("onlyonedisplay=true") && !response.allPropertiesUrl.includes("onlyonedisplay=true")
          ? `${response.allPropertiesUrl}${response.allPropertiesUrl.includes('?') ? '&' : '?'}onlyonedisplay=true`
          : response.allPropertiesUrl;
        
        console.log(`Using all properties URL: ${finalUrl}`);
        
        // Call the function recursively with the new URL
        return importListingsFromBrokerProfile(
          finalUrl,
          userId,
          onProgressUpdate
        );
      }

      // Extract listing URLs
      const listingUrls = response.listingUrls || [];
      console.log(`Found ${listingUrls.length} listings on page ${currentPage}`);
      
      // Update total if we have this information
      if (response.totalListings && stats.total === 0) {
        stats.total = response.totalListings;
        console.log(`Total listings to import: ${stats.total}`);
      }

      // Import each listing
      for (const listingUrl of listingUrls) {
        try {
          console.log(`Importing listing: ${listingUrl}`);
          await importCentrisListing(listingUrl, userId);
          stats.imported++;
          
          if (onProgressUpdate) {
            onProgressUpdate(stats.imported, stats.total, stats.failed);
          }
        } catch (err) {
          console.error(`Failed to import listing ${listingUrl}:`, err);
          stats.failed++;
          stats.failedUrls.push(listingUrl);
          
          if (onProgressUpdate) {
            onProgressUpdate(stats.imported, stats.total, stats.failed);
          }
        }
      }

      // Update pagination info
      hasNextPage = response.hasNextPage;
      
      if (response.totalPages && response.totalPages > totalPages) {
        totalPages = response.totalPages;
      }
      
      if (hasNextPage) {
        currentPage++;
      }
    }

    return stats;
  } catch (error) {
    console.error("Error in importListingsFromBrokerProfile:", error);
    throw error;
  }
}

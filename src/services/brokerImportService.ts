
import { supabase } from "@/integrations/supabase/client";
import { importCentrisListing } from "./centrisImportService";
import { toast } from "sonner";

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  failedUrls: { url: string; error: string }[];
}

export const importListingsFromBrokerProfile = async (
  brokerUrl: string, 
  userId: string,
  onProgressUpdate?: (progress: ImportProgress) => void
) => {
  try {
    const progress: ImportProgress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      failedUrls: []
    };

    // Initialize with first page
    let currentPage = 1;
    let hasNextPage = true;
    let allListingUrls: string[] = [];
    let displayedPropertyCount = 0;
    let maxRetries = 5;
    let maxPages = 20; // Limit to 20 pages to avoid infinite loops
    
    // Flag to check if we've already tried the "allPropertiesUrl"
    let hasTriedAllPropertiesUrl = false;
    
    // Collect all listing URLs from all pages
    while (hasNextPage && currentPage <= maxPages) {
      console.log(`Fetching listings from page ${currentPage}...`);
      
      let retryCount = 0;
      let success = false;
      let response = null;
      let error = null;
      
      // Add retry logic for the scrape-broker-profile function
      while (retryCount < maxRetries && !success) {
        try {
          console.log(`Making request to scrape-broker-profile with URL: ${brokerUrl}, page: ${currentPage}`);
          
          const result = await supabase.functions.invoke('scrape-broker-profile', {
            body: { brokerUrl, page: currentPage }
          });
          
          error = result.error;
          response = result.data;
          
          if (!error && response) {
            console.log("Scraping function response:", response);
            success = true;
          } else {
            retryCount++;
            console.log(`Retry ${retryCount}/${maxRetries} after error:`, error || "No data received");
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Increase delay with each retry
          }
        } catch (err) {
          error = err;
          retryCount++;
          console.error(`Exception on retry ${retryCount}/${maxRetries}:`, err);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
      }
      
      if (error) {
        console.error(`Error scraping page ${currentPage} after ${maxRetries} attempts:`, error);
        throw new Error(`Error scraping page ${currentPage}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      }
      
      if (!response) {
        console.error('No response data received from scrape-broker-profile after multiple attempts');
        throw new Error("Aucune donnée reçue du serveur après plusieurs tentatives");
      }
      
      if (response.error) {
        console.error(`Error in scrape-broker-profile response:`, response.error);
        throw new Error(`Erreur lors du scraping: ${response.error}`);
      }
      
      // Check if we need to use the "Voir toutes les propriétés" URL
      if (response.hasAllPropertiesLink && response.allPropertiesUrl && !hasTriedAllPropertiesUrl) {
        console.log('Found "Voir toutes les propriétés" URL:', response.allPropertiesUrl);
        
        // Set the flag to avoid infinite loops
        hasTriedAllPropertiesUrl = true;
        
        // Call the function recursively with the new URL
        return importListingsFromBrokerProfile(
          response.allPropertiesUrl,
          userId,
          onProgressUpdate
        );
      }
      
      if (!response.listingUrls || response.listingUrls.length === 0) {
        console.log(`No listings found on page ${currentPage}`);
        
        // If we're on the first page and no listings found, throw an error
        if (currentPage === 1 && allListingUrls.length === 0) {
          throw new Error("Aucune annonce trouvée sur le profil du courtier");
        }
        
        break;
      }
      
      // Add the URLs from this page
      allListingUrls = [...allListingUrls, ...response.listingUrls];
      console.log(`Added ${response.listingUrls.length} listings from page ${currentPage}`);
      
      // Update with displayedPropertyCount if available
      if (response.displayedPropertyCount && currentPage === 1) {
        displayedPropertyCount = response.displayedPropertyCount;
        console.log(`Actual property count from profile: ${displayedPropertyCount}`);
      }
      
      hasNextPage = response.hasNextPage && response.totalPages > currentPage;
      currentPage++;
      
      // Update progress with total count after first page
      if (currentPage === 2) {
        if (displayedPropertyCount > 0) {
          // Use the property count from the page if available
          progress.total = displayedPropertyCount;
        } else if (response.totalPages && response.listingUrls.length) {
          // Estimate based on listings per page × total pages
          progress.total = response.totalPages * response.listingUrls.length;
        } else {
          progress.total = allListingUrls.length;
        }
        
        if (onProgressUpdate) onProgressUpdate({...progress});
      }
    }
    
    // Check if we have any listings
    if (allListingUrls.length === 0) {
      throw new Error("Aucune annonce trouvée sur le profil du courtier");
    }
    
    // Deduplicate URLs by converting to Set and back to Array
    const uniqueListingUrls = [...new Set(allListingUrls)];
    console.log(`Found ${uniqueListingUrls.length} unique listing URLs`);
    
    // If we have displayedPropertyCount from the page and it's less than our uniqueListingUrls
    // Make sure we don't process more than what should be there
    if (displayedPropertyCount > 0 && displayedPropertyCount < uniqueListingUrls.length) {
      console.log(`Limiting import to ${displayedPropertyCount} listings (displayed on profile) instead of ${uniqueListingUrls.length} found URLs`);
      progress.total = displayedPropertyCount;
    } else {
      progress.total = uniqueListingUrls.length;
    }
    
    console.log(`Found ${progress.total} unique listings to import`);
    
    if (onProgressUpdate) onProgressUpdate({...progress});
    
    // Get number of listings to process (either all unique URLs, or limited by displayedPropertyCount)
    const listingsToProcess = displayedPropertyCount > 0 && displayedPropertyCount < uniqueListingUrls.length 
      ? uniqueListingUrls.slice(0, displayedPropertyCount) 
      : uniqueListingUrls;
    
    // Import listings one by one with rate limiting to avoid overloading
    for (const listingUrl of listingsToProcess) {
      try {
        console.log(`Importing listing: ${listingUrl}`);
        await importCentrisListing(listingUrl, userId);
        progress.successful++;
      } catch (error) {
        console.error(`Failed to import listing ${listingUrl}:`, error);
        progress.failed++;
        progress.failedUrls.push({ 
          url: listingUrl, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      progress.processed++;
      if (onProgressUpdate) onProgressUpdate({...progress});
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    return {
      success: true,
      ...progress
    };
  } catch (error) {
    console.error("Error in bulk import:", error);
    throw new Error(error instanceof Error ? error.message : "Error during bulk import");
  }
};

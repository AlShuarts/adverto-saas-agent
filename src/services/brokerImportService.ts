
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
    
    // Collect all listing URLs from all pages
    while (hasNextPage) {
      console.log(`Fetching listings from page ${currentPage}...`);
      
      const { data: response, error } = await supabase.functions.invoke('scrape-broker-profile', {
        body: { brokerUrl, page: currentPage }
      });
      
      if (error) {
        console.error(`Error scraping page ${currentPage}:`, error);
        throw new Error(`Error scraping page ${currentPage}: ${error.message}`);
      }
      
      console.log('Response from scrape-broker-profile:', response);
      
      if (!response || !response.listingUrls || response.listingUrls.length === 0) {
        console.log(`No listings found on page ${currentPage}`);
        
        // Check if there was an "Voir toutes les propriétés" link and we have an alternate URL
        if (response.hasAllPropertiesLink && response.allPropertiesUrl) {
          console.log('Trying to use "Voir toutes les propriétés" URL:', response.allPropertiesUrl);
          
          // Call the function again with the new URL
          return importListingsFromBrokerProfile(
            response.allPropertiesUrl,
            userId,
            onProgressUpdate
          );
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
    
    // Deduplicate URLs by converting to Set and back to Array
    const uniqueListingUrls = [...new Set(allListingUrls)];
    
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

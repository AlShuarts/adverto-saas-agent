
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
      
      if (!response || !response.listingUrls || response.listingUrls.length === 0) {
        console.log(`No listings found on page ${currentPage}`);
        break;
      }
      
      allListingUrls = [...allListingUrls, ...response.listingUrls];
      console.log(`Added ${response.listingUrls.length} listings from page ${currentPage}`);
      
      hasNextPage = response.hasNextPage && currentPage < response.totalPages;
      currentPage++;
      
      // Update progress with total count after first page
      if (currentPage === 2) {
        progress.total = response.totalPages * response.listingUrls.length;
        if (onProgressUpdate) onProgressUpdate({...progress});
      }
    }
    
    // Deduplicate URLs
    const uniqueListingUrls = [...new Set(allListingUrls)];
    progress.total = uniqueListingUrls.length;
    console.log(`Found ${progress.total} unique listings to import`);
    
    if (onProgressUpdate) onProgressUpdate({...progress});
    
    // Import listings one by one with rate limiting to avoid overloading
    for (const listingUrl of uniqueListingUrls) {
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

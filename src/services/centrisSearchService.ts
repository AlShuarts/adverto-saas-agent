
import { supabase } from "@/integrations/supabase/client";
import { importCentrisListing } from "./centrisImportService";

type ProgressUpdateCallback = (
  imported: number,
  total: number
) => void;

interface ImportResult {
  imported: number;
  total: number;
  failed: number;
}

export async function importListingsFromSearchUrl(
  searchUrl: string,
  userId: string,
  onProgressUpdate?: ProgressUpdateCallback
): Promise<ImportResult> {
  try {
    // Statistics tracking
    const stats = {
      imported: 0,
      total: 0,
      failed: 0,
      failedUrls: [] as string[]
    };

    console.log("Calling scrape-search-results with URL:", searchUrl);
    
    // Call the Supabase Edge Function to scrape search results
    const { data: response, error } = await supabase.functions.invoke(
      "scrape-search-results",
      {
        body: {
          searchUrl,
          page: 1,
        },
      }
    );

    // Handle errors
    if (error) {
      console.error(`Error scraping search results:`, error);
      throw new Error(`Erreur lors de l'extraction: ${error.message}`);
    }

    if (response.error) {
      console.error(`API reported error:`, response.error);
      throw new Error(`Erreur lors de l'extraction: ${response.error}`);
    }

    // Extract listing URLs
    const listingUrls = response.listingUrls || [];
    console.log(`Found ${listingUrls.length} listings to import`);
    
    // Update total count
    stats.total = listingUrls.length;
    
    if (onProgressUpdate) {
      onProgressUpdate(stats.imported, stats.total);
    }

    if (listingUrls.length === 0) {
      return stats; // Return early if no listings were found
    }

    // Import each listing one by one
    for (const listingUrl of listingUrls) {
      try {
        console.log(`Importing listing: ${listingUrl}`);
        await importCentrisListing(listingUrl, userId);
        stats.imported++;
        
        if (onProgressUpdate) {
          onProgressUpdate(stats.imported, stats.total);
        }
      } catch (err) {
        console.error(`Failed to import listing ${listingUrl}:`, err);
        stats.failed++;
        stats.failedUrls.push(listingUrl);
      }
    }

    return stats;
  } catch (error) {
    console.error("Error in importListingsFromSearchUrl:", error);
    throw error;
  }
}

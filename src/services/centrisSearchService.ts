
import { supabase } from "@/integrations/supabase/client";
import { importCentrisListing } from "./centrisImportService";
import { toast } from "sonner";

type ProgressUpdateCallback = (
  imported: number,
  total: number
) => void;

interface ImportResult {
  imported: number;
  total: number;
  failed: number;
  failedUrls: string[];
  captchaDetected?: boolean;
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
      failedUrls: [] as string[],
      captchaDetected: false
    };

    console.log("Calling scrape-search-results with URL:", searchUrl);
    
    // Call the Supabase Edge Function to scrape search results
    const { data: response, error: functionError } = await supabase.functions.invoke(
      "scrape-search-results",
      {
        body: {
          searchUrl,
          page: 1,
        },
      }
    );

    // Handle errors
    if (functionError) {
      console.error(`Error scraping search results:`, functionError);
      throw new Error(`Erreur lors de l'extraction: ${functionError.message}`);
    }

    if (response.error) {
      console.error(`API reported error:`, response.error);
      
      // Check if captcha was detected
      if (response.captchaDetected) {
        stats.captchaDetected = true;
        throw new Error(`Accès bloqué par Centris. L'application est détectée comme un robot. Veuillez réessayer plus tard ou importer les annonces une par une.`);
      }
      
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

    // Process listings in smaller batches to avoid detection
    const batchSize = 3; // Process 3 listings at a time
    const batches = [];
    
    // Split listings into batches
    for (let i = 0; i < listingUrls.length; i += batchSize) {
      batches.push(listingUrls.slice(i, i + batchSize));
    }
    
    // Process each batch with a delay between batches
    for (const batch of batches) {
      // Process listings in the current batch
      const batchPromises = batch.map(async (listingUrl) => {
        try {
          console.log(`Importing listing: ${listingUrl}`);
          await importCentrisListing(listingUrl, userId);
          stats.imported++;
          
          if (onProgressUpdate) {
            onProgressUpdate(stats.imported, stats.total);
          }
          
          // Add a small random delay between listings in the same batch (0.3-1 second)
          const listingDelay = 300 + Math.floor(Math.random() * 700);
          await new Promise(r => setTimeout(r, listingDelay));
          
          return { success: true };
        } catch (err) {
          console.error(`Failed to import listing ${listingUrl}:`, err);
          stats.failed++;
          stats.failedUrls.push(listingUrl);
          return { success: false, url: listingUrl };
        }
      });
      
      // Wait for the current batch to complete
      await Promise.all(batchPromises);
      
      // Add a longer delay between batches (2-5 seconds) to reduce load on server
      if (batches.indexOf(batch) < batches.length - 1) {
        const batchDelay = 2000 + Math.floor(Math.random() * 3000);
        console.log(`Waiting ${batchDelay}ms before processing next batch...`);
        await new Promise(r => setTimeout(r, batchDelay));
      }
    }

    return stats;
  } catch (error) {
    console.error("Error in importListingsFromSearchUrl:", error);
    throw error;
  }
}

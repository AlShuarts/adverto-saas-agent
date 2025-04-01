
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

    // Import each listing one by one
    for (const listingUrl of listingUrls) {
      try {
        console.log(`Importing listing: ${listingUrl}`);
        await importCentrisListing(listingUrl, userId);
        stats.imported++;
        
        if (onProgressUpdate) {
          onProgressUpdate(stats.imported, stats.total);
        }
        
        // Add a small delay between imports to avoid overloading the server
        await new Promise(r => setTimeout(r, 300));
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

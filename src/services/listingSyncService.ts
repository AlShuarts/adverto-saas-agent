
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { validateBrokerUrl } from "../../supabase/functions/scrape-broker-profile/utils/url-utils";
import { toast } from "sonner";

export interface SyncStats {
  newListings: number;
  removedListings: number;
  unchangedListings: number;
  errors: number;
  lastSyncDate: Date;
}

/**
 * Synchronise les listings d'un courtier avec la base de données
 * Cette fonction effectue une importation légère des listings
 */
export async function synchronizeListings(brokerUrl: string, userId: string): Promise<SyncStats> {
  // Valider l'URL
  if (!validateBrokerUrl(brokerUrl)) {
    throw new Error("URL de profil courtier invalide");
  }

  console.log("Début de la synchronisation des listings:", brokerUrl);
  
  const stats: SyncStats = {
    newListings: 0,
    removedListings: 0,
    unchangedListings: 0,
    errors: 0,
    lastSyncDate: new Date()
  };

  try {
    // Récupérer les listings existants de l'utilisateur
    const { data: existingListings, error: existingError } = await supabase
      .from("listings")
      .select("centris_id, centris_url")
      .eq("user_id", userId);

    if (existingError) {
      throw new Error(`Erreur lors de la récupération des listings existants: ${existingError.message}`);
    }

    // Créer un ensemble des IDs Centris existants pour faciliter la comparaison
    const existingCentrisIds = new Set(existingListings.map(listing => listing.centris_id));
    
    // Appeler la fonction Edge pour récupérer les liens des listings actuels
    const { data: response, error: functionError } = await supabase.functions.invoke(
      "scrape-broker-profile",
      {
        body: {
          brokerUrl,
          page: 1,
          lightMode: true, // Mode léger pour ne récupérer que les liens
        },
      }
    );

    if (functionError) {
      throw new Error(`Erreur lors de l'extraction des listings: ${functionError.message}`);
    }

    if (response.error) {
      throw new Error(`Erreur lors de l'extraction: ${response.error}`);
    }

    // Si nous avons trouvé le lien "Voir toutes les propriétés", utiliser ce lien
    if (response.hasAllPropertiesLink && response.allPropertiesUrl) {
      console.log("Redirection vers le lien 'Voir toutes les propriétés'");
      return synchronizeListings(response.allPropertiesUrl, userId);
    }

    // Récupérer les liens des listings
    const listingUrls = response.listingUrls || [];
    console.log(`Trouvé ${listingUrls.length} listings sur la page 1`);

    if (listingUrls.length === 0) {
      throw new Error("Aucun listing trouvé à synchroniser");
    }

    // Pour chaque URL de listing, vérifier s'il existe déjà et l'ajouter si nécessaire
    for (const listingUrl of listingUrls) {
      try {
        // Extraire l'ID Centris de l'URL
        const centrisId = extractCentrisIdFromUrl(listingUrl);
        
        if (!centrisId) {
          console.error(`Impossible d'extraire l'ID Centris de: ${listingUrl}`);
          stats.errors++;
          continue;
        }

        // Vérifier si le listing existe déjà
        if (existingCentrisIds.has(centrisId)) {
          stats.unchangedListings++;
          continue;
        }

        // C'est un nouveau listing, l'ajouter à la base de données avec le minimum d'informations
        const { error: insertError } = await supabase
          .from("listings")
          .insert({
            centris_id: centrisId,
            centris_url: listingUrl,
            title: "Propriété à vendre", // Titre générique par défaut
            user_id: userId,
            is_fully_scraped: false, // Indique que les détails complets n'ont pas été récupérés
          });

        if (insertError) {
          console.error(`Erreur d'insertion du listing ${centrisId}:`, insertError);
          stats.errors++;
        } else {
          stats.newListings++;
        }
      } catch (err) {
        console.error(`Erreur lors du traitement de l'URL ${listingUrl}:`, err);
        stats.errors++;
      }
    }

    // Mettre à jour le timestamp de dernière synchronisation
    await supabase
      .from("profiles")
      .update({ 
        last_sync_timestamp: new Date().toISOString(),
        broker_sync_url: brokerUrl
      })
      .eq("id", userId);
      
    console.log(`Synchronisation terminée: ${stats.newListings} nouveaux listings, ${stats.unchangedListings} inchangés, ${stats.errors} erreurs`);
    return stats;
    
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    throw error;
  }
}

/**
 * Charge les détails complets d'un listing spécifique
 */
export async function loadListingDetails(listingId: string, userId: string): Promise<Tables<"listings">> {
  console.log(`Chargement des détails du listing ${listingId}`);
  
  try {
    // Récupérer le listing existant
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération du listing: ${fetchError.message}`);
    }

    // Si le listing est déjà complètement scrapé, le retourner directement
    if (listing.is_fully_scraped) {
      return listing;
    }

    // Si nous n'avons pas d'URL Centris, impossible de scraper
    if (!listing.centris_url) {
      throw new Error("URL Centris manquante pour ce listing");
    }

    // Appeler la fonction Edge pour scraper les détails complets
    const { data: scrapedData, error: scrapingError } = await supabase.functions.invoke(
      "scrape-centris", 
      {
        body: { url: listing.centris_url }
      }
    );

    if (scrapingError) {
      throw new Error(`Erreur lors du scraping: ${scrapingError.message}`);
    }

    // Mise à jour du listing avec les données complètes
    const updatedData = {
      ...scrapedData,
      is_fully_scraped: true,
    };

    const { data: updatedListing, error: updateError } = await supabase
      .from("listings")
      .update(updatedData)
      .eq("id", listingId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour du listing: ${updateError.message}`);
    }

    return updatedListing;
  } catch (error) {
    console.error("Erreur lors du chargement des détails:", error);
    throw error;
  }
}

/**
 * Vérifie s'il est temps de resynchroniser les listings
 * (par défaut toutes les 12 heures)
 */
export async function shouldSynchronize(userId: string, hourInterval = 12): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("last_sync_timestamp, broker_sync_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification du profil:", error);
      return true; // En cas d'erreur, on considère qu'il faut synchroniser
    }

    // Si pas d'URL de synchronisation ou jamais synchronisé, retourner false
    if (!profile.broker_sync_url || !profile.last_sync_timestamp) {
      return false;
    }

    // Calculer l'intervalle de temps écoulé depuis la dernière synchronisation
    const lastSync = new Date(profile.last_sync_timestamp);
    const now = new Date();
    const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastSync >= hourInterval;
  } catch (e) {
    console.error("Erreur inattendue lors de la vérification de synchronisation:", e);
    return false;
  }
}

/**
 * Extrait l'ID Centris de l'URL d'un listing
 */
function extractCentrisIdFromUrl(url: string): string | null {
  try {
    // Les URLs de listings Centris se terminent généralement par un ID numérique
    const match = url.match(/\/([0-9]+)$/);
    return match ? match[1] : null;
  } catch (e) {
    console.error("Erreur lors de l'extraction de l'ID Centris:", e);
    return null;
  }
}

/**
 * Récupère l'URL de synchronisation enregistrée pour l'utilisateur
 */
export async function getSavedBrokerUrl(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("broker_sync_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.broker_sync_url;
  } catch (e) {
    console.error("Erreur lors de la récupération de l'URL de synchronisation:", e);
    return null;
  }
}

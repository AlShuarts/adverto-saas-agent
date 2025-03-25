
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { 
  synchronizeListings, 
  shouldSynchronize, 
  getSavedBrokerUrl,
  SyncStats 
} from "@/services/listingSyncService";
import { toast } from "sonner";

export const useSyncListings = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStats, setLastSyncStats] = useState<SyncStats | null>(null);
  const [savedBrokerUrl, setSavedBrokerUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Vérifier au chargement si une URL de courtier est enregistrée
  useEffect(() => {
    const checkSavedUrl = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const url = await getSavedBrokerUrl(userData.user.id);
          setSavedBrokerUrl(url);
          
          // Si une URL est enregistrée, vérifier s'il faut synchroniser
          if (url) {
            const shouldSync = await shouldSynchronize(userData.user.id);
            if (shouldSync) {
              // Synchronisation automatique
              console.log("Synchronisation automatique déclenchée");
              syncListings(url);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'URL enregistrée:", error);
      }
    };
    
    checkSavedUrl();
  }, []);

  // Fonction pour synchroniser les listings
  const syncListings = async (brokerUrl: string) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("Erreur d'authentification");
      if (!userData.user) throw new Error("Non authentifié");

      // Afficher un toast pour indiquer que la synchronisation est en cours
      toast.info("Synchronisation des listings en cours...");

      // Lancer la synchronisation
      const stats = await synchronizeListings(brokerUrl, userData.user.id);
      setLastSyncStats(stats);
      
      // Rafraîchir les données des listings
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      // Construire un message de résultat
      let resultMessage = "";
      if (stats.newListings > 0) {
        resultMessage += `${stats.newListings} nouveau(x) listing(s) trouvé(s). `;
      }
      if (stats.errors > 0) {
        resultMessage += `${stats.errors} erreur(s) rencontrée(s). `;
      }
      if (stats.newListings === 0 && stats.errors === 0) {
        resultMessage = "Aucun nouveau listing trouvé.";
      }
      
      // Afficher le résultat
      if (stats.errors > 0) {
        toast.warning("Synchronisation terminée avec avertissements", {
          description: resultMessage
        });
      } else if (stats.newListings > 0) {
        toast.success("Synchronisation réussie", {
          description: resultMessage
        });
      } else {
        toast.info("Synchronisation terminée", {
          description: resultMessage
        });
      }
      
      // Mettre à jour l'URL sauvegardée
      setSavedBrokerUrl(brokerUrl);
      
    } catch (error) {
      console.error("Erreur de synchronisation:", error);
      toast.error("Erreur de synchronisation", {
        description: error instanceof Error ? error.message : "Une erreur est survenue"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncListings,
    isSyncing,
    lastSyncStats,
    savedBrokerUrl
  };
};

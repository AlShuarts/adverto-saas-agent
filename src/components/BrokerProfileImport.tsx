
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { importListingsFromBrokerProfile } from "@/services/brokerImportService";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSyncListings } from "@/hooks/useSyncListings";
import { toast } from "sonner";

export const BrokerProfileImport = () => {
  const { toast: uiToast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ imported: 0, total: 0, failed: 0 });
  const [importToastId, setImportToastId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [importType, setImportType] = useState<"profile" | "direct" | "sync">("profile");
  const { syncListings, isSyncing, savedBrokerUrl } = useSyncListings();

  const handleImport = async () => {
    if (!url.includes("centris.ca")) {
      toast("URL invalide", {
        description: "Veuillez entrer une URL Centris valide"
      });
      return;
    }

    // Si c'est une synchronisation, utilisez la nouvelle méthode
    if (importType === "sync") {
      await syncListings(url);
      return;
    }

    // Sinon, utilisez l'ancien système d'importation
    setLoading(true);
    setProgress({ imported: 0, total: 0, failed: 0 });
    
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("Erreur d'authentification: " + authError.message);
      if (!userData.user) throw new Error("Non authentifié");

      // Log the original URL for debugging
      console.log("URL originale:", url);
      
      // Display initial toast and store its ID
      const toastId = toast("Import en cours", {
        description: importType === "profile" 
          ? "Récupération des annonces du profil de courtier..." 
          : "Récupération des annonces..."
      });
      
      // Store the toast ID if needed for updates
      if (toastId) {
        setImportToastId(String(toastId));
      }

      const stats = await importListingsFromBrokerProfile(
        url, 
        userData.user.id,
        (imported, total, failed) => {
          setProgress({ imported, total, failed });
        }
      );

      // Refresh listings
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      // Update the previous toast if it exists
      if (importToastId) {
        toast("Import terminé", {
          description: `${stats.imported} annonce(s) importée(s), ${stats.failed} échec(s)`
        });
      } else {
        // Show final results as a new toast if no previous toast ID exists
        if (stats.imported > 0) {
          toast("Import terminé", {
            description: `${stats.imported} annonce(s) importée(s), ${stats.failed} échec(s)`
          });
        } else if (stats.failed > 0) {
          toast("Import échoué", {
            description: `Aucune annonce importée, ${stats.failed} échec(s)`
          });
        } else {
          toast("Aucune annonce trouvée", {
            description: "Vérifiez que l'URL est correcte ou essayez une autre page"
          });
        }
      }

      setUrl("");
    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast("Erreur d'importation", {
        description: error instanceof Error ? error.message : "Impossible d'importer les annonces"
      });
    } finally {
      setLoading(false);
      setImportToastId(null);
    }
  };

  const progressPercentage = 
    progress.total > 0 
      ? Math.round((progress.imported / progress.total) * 100) 
      : 0;

  return (
    <div className="space-y-4">
      <Tabs value={importType} onValueChange={(v) => setImportType(v as "profile" | "direct" | "sync")}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="profile">Profil de courtier</TabsTrigger>
          <TabsTrigger value="direct">URL de recherche</TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="text-sm text-muted-foreground mb-4">
            Collez l'URL du profil d'un courtier Centris pour importer toutes ses annonces
          </div>
        </TabsContent>
        
        <TabsContent value="direct">
          <div className="text-sm text-muted-foreground mb-4">
            Collez une URL de recherche Centris qui contient le paramètre <code className="bg-muted px-1 rounded">uc=X</code> pour importer directement les annonces (plus efficace)
          </div>
        </TabsContent>
        
        <TabsContent value="sync">
          <div className="text-sm text-muted-foreground mb-4">
            Enregistrez l'URL de votre profil ou de recherche pour synchroniser régulièrement vos annonces sans scraper tous les détails immédiatement
          </div>
          {savedBrokerUrl && (
            <div className="text-sm bg-muted p-2 rounded mb-4">
              URL de synchronisation active: <span className="font-mono text-xs">{savedBrokerUrl}</span>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex gap-4">
        <Input
          type="url"
          placeholder={
            importType === "profile" 
              ? "URL du profil de courtier Centris" 
              : importType === "direct"
              ? "URL de recherche avec paramètre uc=X"
              : "URL du profil ou de recherche à synchroniser"
          }
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleImport} 
          disabled={loading || (importType === "sync" && isSyncing)}
        >
          {importType === "sync" 
            ? (isSyncing ? "Synchronisation..." : "Enregistrer & Synchroniser") 
            : (loading ? "Importation..." : "Importer")}
        </Button>
      </div>
      
      {(loading || (importType === "sync" && isSyncing)) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {importType === "sync" 
                ? "Synchronisation en cours..." 
                : `${progress.imported} sur ${progress.total || "?"} annonces importées`}
            </span>
            {importType !== "sync" && <span>{progressPercentage}%</span>}
          </div>
          <Progress 
            value={importType === "sync" ? undefined : progressPercentage} 
            className={`h-2 ${importType === "sync" ? "animate-pulse" : ""}`} 
          />
          {progress.failed > 0 && (
            <p className="text-sm text-destructive">
              {progress.failed} annonce(s) non importée(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

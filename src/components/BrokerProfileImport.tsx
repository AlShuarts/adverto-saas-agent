
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { importListingsFromBrokerProfile } from "@/services/brokerImportService";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

export const BrokerProfileImport = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ imported: 0, total: 0, failed: 0 });
  const [importToastId, setImportToastId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleImport = async () => {
    if (!url.includes("centris.ca") || !url.includes("courtier-immobilier")) {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL de profil de courtier Centris valide",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress({ imported: 0, total: 0, failed: 0 });
    
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("Erreur d'authentification: " + authError.message);
      if (!userData.user) throw new Error("Non authentifié");

      // Log the original URL for debugging
      console.log("URL originale du profil:", url);
      
      // Display initial toast and store its ID
      const toastId = toast({
        title: "Import en cours",
        description: "Récupération des annonces du profil de courtier...",
      }).id;
      
      setImportToastId(toastId);

      const stats = await importListingsFromBrokerProfile(
        url, 
        userData.user.id,
        (imported, total, failed) => {
          setProgress({ imported, total, failed });
        }
      );

      // Refresh listings
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      // Dismiss the previous toast if it exists
      if (importToastId) {
        toast({
          id: importToastId,
          title: "Import terminé",
          description: `${stats.imported} annonce(s) importée(s), ${stats.failed} échec(s)`,
        });
      } else {
        // Show final results as a new toast if no previous toast ID exists
        if (stats.imported > 0) {
          toast({
            title: "Import terminé",
            description: `${stats.imported} annonce(s) importée(s), ${stats.failed} échec(s)`,
          });
        } else if (stats.failed > 0) {
          toast({
            title: "Import échoué",
            description: `Aucune annonce importée, ${stats.failed} échec(s)`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Aucune annonce trouvée",
            description: "Vérifiez que l'URL du profil est correcte ou essayez une autre page",
            variant: "destructive",
          });
        }
      }

      setUrl("");
    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast({
        title: "Erreur d'importation",
        description: error instanceof Error ? error.message : "Impossible d'importer les annonces",
        variant: "destructive",
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
      <div className="flex gap-4">
        <Input
          type="url"
          placeholder="Collez l'URL du profil de courtier Centris ici"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleImport} disabled={loading}>
          {loading ? "Importation..." : "Importer"}
        </Button>
      </div>
      
      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {progress.imported} sur {progress.total || "?"} annonces importées
            </span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
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


import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { importListingsFromBrokerProfile } from "@/services/brokerImportService";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const BrokerProfileImport = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ imported: 0, total: 0, failed: 0 });
  const [importToastId, setImportToastId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [importType, setImportType] = useState<"profile" | "direct">("profile");

  const handleImport = async () => {
    if (!url.includes("centris.ca")) {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL Centris valide",
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
      console.log("URL originale:", url);
      
      // Display initial toast and store its ID
      const toastId = toast({
        title: "Import en cours",
        description: importType === "profile" 
          ? "Récupération des annonces du profil de courtier..." 
          : "Récupération des annonces...",
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

      // Update the previous toast if it exists
      if (importToastId) {
        toast({
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
            description: "Vérifiez que l'URL est correcte ou essayez une autre page",
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
      <Tabs value={importType} onValueChange={(v) => setImportType(v as "profile" | "direct")}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="profile">Profil de courtier</TabsTrigger>
          <TabsTrigger value="direct">URL de recherche</TabsTrigger>
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
      </Tabs>
      
      <div className="flex gap-4">
        <Input
          type="url"
          placeholder={
            importType === "profile" 
              ? "URL du profil de courtier Centris" 
              : "URL de recherche avec paramètre uc=X"
          }
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

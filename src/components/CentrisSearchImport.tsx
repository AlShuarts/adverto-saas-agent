
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { importListingsFromSearchUrl } from "@/services/centrisSearchService";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const CentrisSearchImport = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [foundListings, setFoundListings] = useState(0);
  const [importedListings, setImportedListings] = useState(0);
  const [processingStep, setProcessingStep] = useState<'idle' | 'scanning' | 'importing'>('idle');
  const queryClient = useQueryClient();

  const handleBulkImport = async () => {
    if (!url.includes("centris.ca")) {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL de recherche Centris valide",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProcessingStep('scanning');
    setProgress(0);
    setFoundListings(0);
    setImportedListings(0);

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("Erreur d'authentification: " + authError.message);
      if (!userData.user) throw new Error("Non authentifié");

      // Function to update progress
      const handleProgress = (importedCount: number, totalCount: number) => {
        setProgress(totalCount > 0 ? Math.floor((importedCount / totalCount) * 100) : 0);
        setImportedListings(importedCount);
        setFoundListings(totalCount);
      };

      // Start the import process
      const result = await importListingsFromSearchUrl(url, userData.user.id, handleProgress);

      // Refresh the listings list
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      toast({
        title: "Importation terminée",
        description: `${result.imported} annonces importées sur ${result.total} trouvées`,
      });

      // Reset form
      setUrl("");
    } catch (error) {
      console.error("Erreur d'importation:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'importer les annonces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProcessingStep('idle');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="url"
          placeholder="Collez l'URL d'une recherche Centris (ex: https://www.centris.ca/fr/propriete~a-vendre)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={handleBulkImport} disabled={loading}>
          {loading ? "Importation..." : "Importer"}
        </Button>
      </div>

      {processingStep !== 'idle' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {processingStep === 'scanning' && (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>Analyse des annonces en cours...</span>
              </>
            )}
            {processingStep === 'importing' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Annonces trouvées : {foundListings}</span>
                <span className="ml-2">Importées : {importedListings}</span>
              </>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};

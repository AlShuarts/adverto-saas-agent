
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { importListingsFromSearchUrl } from "@/services/centrisSearchService";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const CentrisSearchImport = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [foundListings, setFoundListings] = useState(0);
  const [importedListings, setImportedListings] = useState(0);
  const [processingStep, setProcessingStep] = useState<'idle' | 'scanning' | 'importing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
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
    setErrorMessage(null);
    setEstimatedTimeRemaining(null);
    setStartTime(Date.now());

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("Erreur d'authentification: " + authError.message);
      if (!userData.user) throw new Error("Non authentifié");

      // Function to update progress and estimate remaining time
      const handleProgress = (importedCount: number, totalCount: number) => {
        setProgress(totalCount > 0 ? Math.floor((importedCount / totalCount) * 100) : 0);
        setImportedListings(importedCount);
        setFoundListings(totalCount);
        
        // Change step to importing once we start processing listings
        if (importedCount > 0 || totalCount > 0) {
          setProcessingStep('importing');
          
          // Calculate estimated time remaining
          if (startTime && importedCount > 0 && totalCount > importedCount) {
            const elapsedMs = Date.now() - startTime;
            const msPerItem = elapsedMs / importedCount;
            const remainingItems = totalCount - importedCount;
            const estimatedRemainingMs = msPerItem * remainingItems;
            const estimatedRemainingMinutes = Math.ceil(estimatedRemainingMs / 60000);
            setEstimatedTimeRemaining(estimatedRemainingMinutes);
          }
        }
      };

      // Start the import process with a timeout for long-running operations
      const importPromise = importListingsFromSearchUrl(url, userData.user.id, handleProgress);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("L'opération a pris trop de temps. Veuillez réessayer.")), 120000);
      });
      
      // Race between the import and the timeout
      const result = await Promise.race([importPromise, timeoutPromise]) as any;

      // Check if captcha was detected
      if (result.captchaDetected) {
        setProcessingStep('error');
        setErrorMessage("Accès bloqué par Centris. L'application est détectée comme un robot. Essayez d'importer les annonces une par une.");
        toast({
          title: "Accès bloqué",
          description: "Centris a détecté notre activité comme automatisée. Essayez d'importer les annonces une par une.",
          variant: "destructive"
        });
        return;
      }

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
      setProcessingStep('error');
      
      // Extract error message
      const errorMsg = error instanceof Error ? error.message : "Impossible d'importer les annonces";
      setErrorMessage(errorMsg);
      
      // Show toast notification
      toast({
        title: "Erreur",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Only reset the processing step if we're not in an error state
      if (processingStep !== 'error') {
        setProcessingStep('idle');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-col sm:flex-row">
        <Input
          type="url"
          placeholder="Collez l'URL d'une recherche Centris (ex: https://www.centris.ca/fr/propriete~a-vendre)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={handleBulkImport} disabled={loading} className="whitespace-nowrap">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            "Importer"
          )}
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
                
                {estimatedTimeRemaining !== null && (
                  <div className="ml-auto flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Temps restant estimé : ~{estimatedTimeRemaining} min</span>
                  </div>
                )}
              </>
            )}
            {processingStep === 'error' && (
              <>
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{errorMessage || "Une erreur est survenue"}</span>
              </>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          
          {processingStep === 'importing' && (
            <div className="text-sm text-muted-foreground mt-1">
              <p>Les annonces sont importées par lots pour éviter d'être bloqué par Centris. Veuillez patienter.</p>
            </div>
          )}
          
          {processingStep === 'error' && (
            <div className="text-sm text-muted-foreground mt-2">
              <p>Conseil: Essayez d'importer les annonces une par une en utilisant l'importation individuelle.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

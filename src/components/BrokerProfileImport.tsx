
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { importListingsFromBrokerProfile } from "@/services/brokerImportService";
import { useQueryClient } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  failedUrls: { url: string; error: string }[];
}

export const BrokerProfileImport = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const queryClient = useQueryClient();

  const handleImport = async () => {
    if (!url.includes("centris.ca")) {
      toast.error("URL invalide", {
        description: "Veuillez entrer une URL de profil Centris valide"
      });
      return;
    }

    setLoading(true);
    setProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      failedUrls: []
    });
    
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("Erreur d'authentification: " + authError.message);
      if (!userData.user) throw new Error("Non authentifié");

      // Log the original URL for debugging
      console.log("URL originale du profil:", url);
      
      // Display initial toast
      const importToast = toast.loading("Import en cours", {
        description: "Récupération des annonces du profil de courtier..."
      });

      await importListingsFromBrokerProfile(
        url, 
        userData.user.id,
        (currentProgress) => {
          setProgress(currentProgress);
          
          // Update toast with progress when we have a total
          if (currentProgress.total > 0 && currentProgress.processed > 0) {
            const percentComplete = Math.round((currentProgress.processed / currentProgress.total) * 100);
            toast.loading(`Import en cours (${percentComplete}%)`, {
              description: `${currentProgress.processed}/${currentProgress.total} annonces traitées`,
              id: importToast
            });
          }
        }
      );

      toast.success("Import terminé", {
        description: `${progress?.successful || 0} annonces importées avec succès${progress?.failed ? `, ${progress.failed} échecs` : ''}`,
        id: importToast
      });

      // Refresh the listings
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    } catch (error) {
      console.error("Erreur complète:", error);
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Impossible d'importer les annonces"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!progress || progress.total === 0) return 0;
    return Math.round((progress.processed / progress.total) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 max-w-xl mx-auto">
        <Input
          type="url"
          placeholder="Collez l'URL du profil de courtier Centris ici"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={handleImport} disabled={loading}>
          {loading ? "Importation..." : "Importer les annonces"}
        </Button>
      </div>
      
      {progress && (
        <div className="space-y-2 max-w-xl mx-auto">
          <div className="flex justify-between text-sm">
            <span>Progression: {progress.processed}/{progress.total}</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
          
          {progress.processed > 0 && (
            <div className="flex justify-between text-sm mt-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{progress.successful} réussies</span>
              </div>
              
              {progress.failed > 0 && (
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>{progress.failed} échouées</span>
                </div>
              )}
            </div>
          )}
          
          {progress.failedUrls.length > 0 && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="failed">
                <AccordionTrigger className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Voir les annonces qui ont échoué ({progress.failedUrls.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    {progress.failedUrls.map((failed, index) => (
                      <div key={index} className="border-l-2 border-red-300 pl-2">
                        <a 
                          href={failed.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                        >
                          {failed.url}
                        </a>
                        <p className="text-red-500">{failed.error}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
};

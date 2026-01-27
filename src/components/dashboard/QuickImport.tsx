import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Link2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { importCentrisListing } from "@/services/centrisImportService";
import { reportErrorDirect } from "@/hooks/useErrorReport";

type QuickImportProps = {
  onImportSuccess: () => void;
};

export const QuickImport = ({ onImportSuccess }: QuickImportProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer une URL Centris valide",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    if (!url.includes("centris.ca")) {
      toast({
        title: "URL invalide",
        description: "L'URL doit provenir de centris.ca",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const listing = await importCentrisListing(url.trim(), user.id);

      setImportSuccess(true);
      setUrl("");
      
      toast({
        title: "Annonce importée !",
        description: listing?.title || "L'annonce a été ajoutée à votre liste",
      });

      onImportSuccess();

      // Reset success state after 3 seconds
      setTimeout(() => setImportSuccess(false), 3000);

    } catch (error) {
      console.error("Import error:", error);
      
      // Envoyer le rapport d'erreur aux admins
      reportErrorDirect(error instanceof Error ? error : new Error(String(error)), {
        errorType: 'import',
        actionContext: 'quick_import_centris',
        additionalData: { url: url.trim() },
      });
      
      toast({
        title: "Erreur d'importation",
        description: error instanceof Error ? error.message : "Impossible d'importer l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          <span className="truncate">Importer une annonce</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="URL Centris..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              className="pl-10 text-sm"
              disabled={isImporting}
            />
          </div>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !url.trim()}
            className="shrink-0"
            size="sm"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : importSuccess ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <span className="hidden sm:inline">Importer</span>
            )}
            {!isImporting && !importSuccess && (
              <Plus className="h-4 w-4 sm:hidden" />
            )}
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
          💡 Collez le lien Centris.ca ici
        </p>
      </CardContent>
    </Card>
  );
};

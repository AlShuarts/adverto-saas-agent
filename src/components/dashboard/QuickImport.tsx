import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Link2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

      const { data, error } = await supabase.functions.invoke('scrape-centris', {
        body: { url: url.trim() }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Erreur d'importation");

      setImportSuccess(true);
      setUrl("");
      
      toast({
        title: "Annonce importée !",
        description: data.listing?.title || "L'annonce a été ajoutée à votre liste",
      });

      onImportSuccess();

      // Reset success state after 3 seconds
      setTimeout(() => setImportSuccess(false), 3000);

    } catch (error) {
      console.error("Import error:", error);
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
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Importer une annonce
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Collez l'URL Centris ici..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              className="pl-10"
              disabled={isImporting}
            />
          </div>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || !url.trim()}
            className="shrink-0"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : importSuccess ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              "Importer"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Copiez le lien depuis Centris.ca et collez-le ici
        </p>
      </CardContent>
    </Card>
  );
};

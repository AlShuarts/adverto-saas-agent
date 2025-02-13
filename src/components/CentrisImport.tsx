
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { importCentrisListing } from "@/services/centrisImportService";
import { useQueryClient } from "@tanstack/react-query";

export const CentrisImport = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error("Erreur d'authentification: " + authError.message);
      if (!userData.user) throw new Error("Non authentifié");

      await importCentrisListing(url, userData.user.id);

      toast({
        title: "Succès",
        description: "L'annonce a été importée avec succès",
      });

      // Rafraîchir la liste des annonces
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      setUrl("");
    } catch (error) {
      console.error("Erreur complète:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'importer l'annonce",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 max-w-xl mx-auto">
      <Input
        type="url"
        placeholder="Collez l'URL de l'annonce Centris ici"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
      />
      <Button onClick={handleImport} disabled={loading}>
        {loading ? "Importation..." : "Importer"}
      </Button>
    </div>
  );
};

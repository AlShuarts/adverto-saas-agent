import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const CentrisImport = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Non authentifié");

      const response = await fetch("/functions/v1/scrape-centris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'extraction");

      const listing = await response.json();

      const { error: insertError } = await supabase
        .from("listings")
        .insert({
          ...listing,
          user_id: userData.user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "L'annonce a été importée avec succès",
      });

      setUrl("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer l'annonce",
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const CentrisImport = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: any): number | null => {
    if (!price) return null;
    try {
      // Enlever les espaces, le symbole $ et les virgules
      const cleanPrice = String(price).replace(/[\s$,]/g, '');
      // Convertir en nombre
      const numericPrice = parseFloat(cleanPrice);
      // Vérifier si c'est un nombre valide et dans les limites de PostgreSQL
      if (isNaN(numericPrice) || numericPrice > 9999999999.99 || numericPrice < -9999999999.99) {
        console.log("Prix invalide ou hors limites:", price, "->", numericPrice);
        return null;
      }
      return numericPrice;
    } catch (error) {
      console.error("Erreur lors du formatage du prix:", error);
      return null;
    }
  };

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

      console.log("Appel de la fonction scrape-centris avec l'URL:", url);
      const { data: response, error: functionError } = await supabase.functions.invoke('scrape-centris', {
        body: { url }
      });

      if (functionError) {
        console.error("Erreur de la fonction scrape-centris:", functionError);
        throw new Error("Erreur lors du scraping: " + functionError.message);
      }

      if (!response) {
        throw new Error("Aucune donnée reçue du scraping");
      }

      console.log("Données reçues du scraping:", response);

      const formattedPrice = formatPrice(response.price);
      console.log("Prix formaté:", response.price, "->", formattedPrice);

      // S'assurer que toutes les propriétés requises sont présentes
      const listingData = {
        centris_id: response.centris_id,
        title: response.title,
        description: response.description || null,
        price: formattedPrice,
        address: response.address || null,
        city: response.city || null,
        postal_code: response.postal_code || null,
        bedrooms: response.bedrooms || null,
        bathrooms: response.bathrooms || null,
        property_type: response.property_type || null,
        images: response.images || null,
        user_id: userData.user.id,
      };

      console.log("Données formatées pour l'insertion:", listingData);

      const { error: insertError } = await supabase
        .from("listings")
        .insert(listingData);

      if (insertError) {
        console.error("Erreur d'insertion dans la base de données:", insertError);
        throw new Error("Erreur lors de l'enregistrement: " + insertError.message);
      }

      toast({
        title: "Succès",
        description: "L'annonce a été importée avec succès",
      });

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
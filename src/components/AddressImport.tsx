
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importCentrisListing } from "@/services/centrisImportService";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SearchResult {
  title: string;
  url: string;
}

export const AddressImport = () => {
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!address.trim()) {
      toast({
        title: "Adresse requise",
        description: "Veuillez entrer une adresse à rechercher",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    setResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke("search-address", {
        body: { address: address.trim() }
      });

      if (error) throw new Error(error.message);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.results || data.results.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Aucune annonce trouvée pour cette adresse. Essayez des termes de recherche différents.",
        });
        return;
      }

      setResults(data.results);
      setShowResults(true);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de rechercher l'adresse",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImport = async (url: string) => {
    setSelectedUrl(url);
    setImportLoading(true);
    
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

      // Fermer la fenêtre de résultats après l'importation réussie
      setShowResults(false);
      setResults([]);
      setAddress("");
    } catch (error) {
      console.error("Erreur complète:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'importer l'annonce",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
      setSelectedUrl(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Entrez l'adresse de la propriété"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !searchLoading) {
              handleSearch();
            }
          }}
        />
        <Button onClick={handleSearch} disabled={searchLoading} className="min-w-20">
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          {searchLoading ? "Recherche..." : "Rechercher"}
        </Button>
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résultats pour "{address}"</DialogTitle>
            <DialogDescription>
              Sélectionnez l'annonce que vous souhaitez importer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun résultat trouvé</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{result.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{result.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(result.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleImport(result.url)}
                      disabled={importLoading && selectedUrl === result.url}
                    >
                      {importLoading && selectedUrl === result.url ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {importLoading && selectedUrl === result.url ? "Importation..." : "Importer"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

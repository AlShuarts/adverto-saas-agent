
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importCentrisListing } from "@/services/centrisImportService";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, ExternalLink, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
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
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log(`Recherche pour l'adresse: ${address.trim()}`);
      
      const { data, error } = await supabase.functions.invoke("search-address", {
        body: { address: address.trim() }
      });

      console.log("Réponse du serveur:", data);
      
      if (error) throw new Error(error.message);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.results || data.results.length === 0) {
        setError("Aucun résultat trouvé");
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
      setError(error instanceof Error ? error.message : "Impossible de rechercher l'adresse");
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

  const handleShowDebugInfo = () => {
    setDebugInfo(JSON.stringify({ results, error }, null, 2));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Textarea
          placeholder="Entrez l'adresse de la propriété (ex: 123 rue Principale, Montréal)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="min-h-[100px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey && !searchLoading) {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">Appuyez sur Ctrl+Enter pour rechercher</p>
          {error && (
            <Button 
              onClick={handleShowDebugInfo} 
              variant="outline" 
              size="sm"
              type="button"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Afficher les détails
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={searchLoading} className="w-full">
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          {searchLoading ? "Recherche en cours..." : "Rechercher"}
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
      
      {debugInfo && (
        <Dialog open={!!debugInfo} onOpenChange={() => setDebugInfo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Informations de débogage</DialogTitle>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-[60vh]">
              <pre className="text-xs">{debugInfo}</pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

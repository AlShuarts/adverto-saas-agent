
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Tag, Image as ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const MediaToolsList = () => {
  const isMobile = useIsMobile();
  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-[200px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-8 bg-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Aucune annonce</h3>
        <p className="text-muted-foreground">
          Importez votre première annonce Centris pour accéder aux outils média
        </p>
      </div>
    );
  }

  // Sélectionner uniquement les 3 derniers listings pour simplifier l'affichage
  const recentListings = listings.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3">Créer un contenu</h2>
        <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-3"} gap-4`}>
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                Diaporamas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground">
                Créez un diaporama professionnel pour vos listings
              </p>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button variant="outline" size="sm" className="w-full">Créer</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Bannières
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground">
                Ajoutez une bannière VENDU ou À VENDRE
              </p>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button variant="outline" size="sm" className="w-full">Créer</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground">
                Gérez et optimisez les images de vos listings
              </p>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button variant="outline" size="sm" className="w-full">Gérer</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Vos derniers listings</h2>
        <div className={`grid grid-cols-1 ${isMobile ? "" : "sm:grid-cols-3"} gap-4`}>
          {recentListings.map((listing) => (
            <ListingMediaCard 
              key={`listing-${listing.id}`}
              listing={listing}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ListingMediaCard = ({ listing }) => {
  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div 
        className="h-32 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${listing.images[0]})` }}
      />
      <CardHeader className="p-3">
        <CardTitle className="text-sm truncate">{listing.title}</CardTitle>
        <CardDescription className="text-xs truncate">{listing.address}</CardDescription>
      </CardHeader>
      <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          <Video className="w-3 h-3 mr-1" />
          Diaporama
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          <Tag className="w-3 h-3 mr-1" />
          Bannière
        </Button>
      </CardFooter>
    </Card>
  );
};

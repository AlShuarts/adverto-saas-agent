
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Tag, Image as ImageIcon } from "lucide-react";

export const MediaToolsList = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[300px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Aucune annonce</h3>
        <p className="text-muted-foreground">
          Importez votre première annonce Centris pour accéder aux outils média
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Diaporamas</h2>
        <p className="text-muted-foreground mb-4">
          Créez des diaporamas professionnels à partir de vos listings
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 6).map((listing) => (
            <ListingMediaCard 
              key={`slideshow-${listing.id}`}
              listing={listing}
              title="Créer un diaporama"
              description="Générez un diaporama professionnel pour ce listing"
              icon={<Video className="h-8 w-8 text-primary" />}
              buttonText="Créer un diaporama"
              buttonIcon={<Video className="h-4 w-4 mr-2" />}
              destination="/slideshow"
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Bannières</h2>
        <p className="text-muted-foreground mb-4">
          Ajoutez des bannières VENDU ou À VENDRE à vos images
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 6).map((listing) => (
            <ListingMediaCard 
              key={`banner-${listing.id}`}
              listing={listing}
              title="Créer une bannière"
              description="Ajoutez une bannière VENDU ou À VENDRE"
              icon={<Tag className="h-8 w-8 text-primary" />}
              buttonText="Créer une bannière"
              buttonIcon={<Tag className="h-4 w-4 mr-2" />}
              destination="/banner"
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        <p className="text-muted-foreground mb-4">
          Gérez les images de vos listings
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 6).map((listing) => (
            <ListingMediaCard 
              key={`images-${listing.id}`}
              listing={listing}
              title="Gérer les images"
              description="Réorganisez ou ajoutez des images"
              icon={<ImageIcon className="h-8 w-8 text-primary" />}
              buttonText="Gérer les images"
              buttonIcon={<ImageIcon className="h-4 w-4 mr-2" />}
              destination="/images"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ListingMediaCard = ({ listing, title, description, icon, buttonText, buttonIcon, destination }) => {
  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div 
        className="h-40 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${listing.images[0]})` }}
      />
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base truncate">{listing.title}</CardTitle>
            <CardDescription className="truncate">{listing.address}</CardDescription>
          </div>
          <div className="p-2 bg-secondary/50 rounded-full">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full"
        >
          {buttonIcon}
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

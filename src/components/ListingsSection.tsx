
import { CentrisImport } from "@/components/CentrisImport";
import { ListingsList } from "@/components/ListingsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Video, Tag, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ListingsSection = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Importer une annonce Centris
        </h2>
        <CentrisImport />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Outils Média
            </CardTitle>
            <CardDescription>
              Créez des diaporamas, bannières et autres contenus visuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/media")} className="w-full">
              Accéder aux outils média
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share className="h-5 w-5 text-primary" />
              Publication Sociale
            </CardTitle>
            <CardDescription>
              Publiez vos listings sur Facebook et Instagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/social")} className="w-full">
              Gérer vos publications
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Listings Publiés
            </CardTitle>
            <CardDescription>
              Consultez et gérez vos listings publiés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/published-listings")} className="w-full">
              Voir les listings publiés
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Vos annonces</h2>
        <ListingsList />
      </div>
    </div>
  );
};

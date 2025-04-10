
import { CentrisImport } from "@/components/CentrisImport";
import { ListingsList } from "@/components/ListingsList";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal, Video, Eye } from "lucide-react";
import { useState } from "react";
import { CreateSlideshowButton } from "@/components/CreateSlideshowButton";

export const ListingsSection = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Importer des annonces Centris
        </h2>
        
        <div className="max-w-xl mx-auto">
          <CentrisImport />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Vos annonces</h2>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </Button>
        </div>
        
        {showFilters && (
          <div className="bg-background rounded-lg p-4 mb-6 border">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-medium">Filtrer par:</span>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Propriété
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Avec diaporama
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Publié
              </Button>
            </div>
          </div>
        )}
        
        <ListingsList />
      </div>
    </div>
  );
};

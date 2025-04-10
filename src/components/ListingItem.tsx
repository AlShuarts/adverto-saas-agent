
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";
import { loadListingDetails } from "@/services/listingSyncService";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/utils/priceFormatter";
import { useQueryClient } from "@tanstack/react-query";
import { ListingImageCarousel } from "./ListingImageCarousel";

interface ListingItemProps {
  listing: Tables<"listings">;
}

export const ListingItem = ({ listing: initialListing }: ListingItemProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [listing, setListing] = useState(initialListing);
  const queryClient = useQueryClient();

  const handleLoadDetails = async () => {
    if (listing.is_fully_scraped) {
      setExpanded(!expanded);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Non authentifié");
      }
      
      // Load details from the listing service
      const updatedListing = await loadListingDetails(listing.id, userData.user.id);
      
      // Update the local state with the new listing data immediately
      setListing(updatedListing);
      
      // Expand details after loading
      setExpanded(true);
      
      // Invalidate the query to refresh other components
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      toast.success("Détails du listing chargés avec succès");
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      toast.error("Erreur lors du chargement des détails", {
        description: error instanceof Error ? error.message : "Une erreur s'est produite"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pour les listings qui n'ont pas encore d'images
  if (!listing.is_fully_scraped && !listing.images) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{listing.title || "Propriété à vendre"}</h3>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleLoadDetails}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                "Charger les détails"
              )}
            </Button>
          </div>
          
          <div className="h-40 bg-muted rounded flex items-center justify-center">
            <p className="text-muted-foreground">
              Cliquez sur "Charger les détails" pour voir les images et informations
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            ID Centris: {listing.centris_id}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si le listing a déjà des informations (est déjà entièrement scrapé)
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          
          {!listing.is_fully_scraped && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleLoadDetails}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                "Charger les détails"
              )}
            </Button>
          )}
          
          {listing.is_fully_scraped && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Moins de détails" : "Plus de détails"}
            </Button>
          )}
        </div>
        
        {listing.images && listing.images.length > 0 ? (
          <ListingImageCarousel images={listing.images} />
        ) : (
          <div className="h-40 bg-muted rounded flex items-center justify-center">
            <p className="text-muted-foreground">Aucune image disponible</p>
          </div>
        )}
        
        <div>
          {listing.price ? (
            <p className="text-xl font-bold">{formatPrice(listing.price)}</p>
          ) : (
            <Skeleton className="h-8 w-32" />
          )}
          
          {listing.address ? (
            <p className="text-sm text-muted-foreground">{listing.address}</p>
          ) : (
            <Skeleton className="h-4 w-64 mt-2" />
          )}
        </div>
        
        {expanded && listing.is_fully_scraped && (
          <div className="space-y-2 pt-2 border-t">
            {listing.description && (
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {listing.description.length > 200 
                    ? `${listing.description.substring(0, 200)}...` 
                    : listing.description}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h4 className="font-medium text-sm">Chambres</h4>
                <p className="text-sm text-muted-foreground">
                  {listing.bedrooms || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Salles de bain</h4>
                <p className="text-sm text-muted-foreground">
                  {listing.bathrooms || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Ville</h4>
                <p className="text-sm text-muted-foreground">
                  {listing.city || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Type</h4>
                <p className="text-sm text-muted-foreground">
                  {listing.property_type || "N/A"}
                </p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => window.open(listing.centris_url, '_blank')}
              >
                Voir sur Centris
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

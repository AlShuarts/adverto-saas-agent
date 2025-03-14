
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { ListingImageCarousel } from "./ListingImageCarousel";
import { formatPrice } from "@/utils/priceFormatter";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Tag, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreateSoldBannerButton } from "./CreateSoldBannerButton";
import { SoldBannerStatus } from "./SoldBannerStatus";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";

type PublishedListingCardProps = {
  listing: Tables<"listings">;
};

export const PublishedListingCard = ({ listing }: PublishedListingCardProps) => {
  const { profile } = useProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  const handleMarkAsSold = async () => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from("listings")
        .update({ is_sold: !listing.is_sold })
        .eq("id", listing.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(
        listing.is_sold 
          ? "Le statut 'Vendu' a été retiré" 
          : "Le listing a été marqué comme vendu !"
      );
      
      queryClient.invalidateQueries({ queryKey: ["published-listings"] });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <ListingImageCarousel images={listing.images || []} />
        {listing.is_sold && (
          <div className="absolute top-0 left-0 w-full bg-black bg-opacity-70 text-white py-2 px-4 text-center font-bold">
            VENDU
          </div>
        )}
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <p className="text-2xl font-bold text-white">
            {formatPrice(listing.price)}
          </p>
          <p className="text-sm text-muted-foreground">{listing.address}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{listing.bedrooms} ch.</span>
            <span>{listing.bathrooms} sdb.</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between w-full py-2">
          <div className="flex items-center gap-2">
            <Switch 
              id={`sold-${listing.id}`} 
              checked={!!listing.is_sold}
              onCheckedChange={handleMarkAsSold}
              disabled={isUpdating}
            />
            <label 
              htmlFor={`sold-${listing.id}`}
              className="text-sm font-medium cursor-pointer"
            >
              Marqué comme vendu
            </label>
          </div>
        </div>
        
        {listing.is_sold && (
          <div className="w-full grid grid-cols-1 gap-2">
            <CreateSoldBannerButton listing={listing} />
            <SoldBannerStatus listing={listing} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

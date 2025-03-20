
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { formatPrice } from "@/utils/priceFormatter";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Tag, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreateSoldBannerButton } from "./CreateSoldBannerButton";
import { SoldBannerStatus } from "./SoldBannerStatus";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

type PublishedListingCardProps = {
  listing: Tables<"listings">;
};

export const PublishedListingCard = ({ listing }: PublishedListingCardProps) => {
  const { profile } = useProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

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
        <div className="relative">
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="w-full h-36 object-cover"
          />
          {listing.is_sold && (
            <div className="absolute top-0 left-0 w-full bg-black bg-opacity-70 text-white py-1 px-2 text-center font-bold text-sm">
              VENDU
            </div>
          )}
        </div>
        <div className="p-3 space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-semibold truncate">{listing.title}</h3>
          </div>
          <p className="text-lg font-bold text-white">
            {formatPrice(listing.price)}
          </p>
          <p className="text-xs text-muted-foreground truncate">{listing.address}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{listing.bedrooms} ch.</span>
            <span>{listing.bathrooms} sdb.</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between w-full py-1">
          <div className="flex items-center gap-1 text-sm">
            <Switch 
              id={`sold-${listing.id}`} 
              checked={!!listing.is_sold}
              onCheckedChange={handleMarkAsSold}
              disabled={isUpdating}
            />
            <label 
              htmlFor={`sold-${listing.id}`}
              className="text-xs font-medium cursor-pointer"
            >
              Vendu
            </label>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {expanded && (
          <div className="w-full grid grid-cols-1 gap-2 pt-1 border-t border-border">
            <CreateSoldBannerButton listing={listing} />
            <SoldBannerStatus listing={listing} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

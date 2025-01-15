import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { formatPrice } from "@/utils/priceFormatter";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Card className="overflow-hidden h-full">
      <div className="aspect-video relative overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Aucune image</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{listing.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold">
            {listing.price ? formatPrice(listing.price) : "Prix sur demande"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {listing.bedrooms && (
              <span>{listing.bedrooms} chambre{listing.bedrooms > 1 ? "s" : ""}</span>
            )}
            {listing.bathrooms && (
              <span>{listing.bathrooms} salle{listing.bathrooms > 1 ? "s" : ""} de bain</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {[listing.address, listing.city].filter(Boolean).join(", ")}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {listing.published_to_facebook ? (
              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                Publié sur Facebook
              </span>
            ) : (
              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                Non publié
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
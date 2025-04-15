
import { formatPrice } from "@/utils/priceFormatter";
import { Tables } from "@/integrations/supabase/types";

type ListingDetailsProps = {
  listing: Tables<"listings">;
};

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  return (
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
  );
};

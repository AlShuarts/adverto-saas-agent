
import { formatPrice } from "@/utils/priceFormatter";
import { Tables } from "@/integrations/supabase/types";

type ListingDetailsProps = {
  listing: Tables<"listings">;
};

export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  return (
    <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 min-w-0">
      <h3 className="text-base sm:text-lg font-semibold truncate">{listing.title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-white">
        {formatPrice(listing.price)}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground truncate">{listing.address}</p>
      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <span>{listing.bedrooms} ch.</span>
        <span>{listing.bathrooms} sdb.</span>
      </div>
    </div>
  );
};

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { ListingImageCarousel } from "./ListingImageCarousel";
import { FacebookPublishButton } from "./FacebookPublishButton";
import { InstagramPublishButton } from "./InstagramPublishButton";
import { formatPrice } from "@/utils/priceFormatter";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <ListingImageCarousel images={listing.images || []} />
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
        <div className="w-full grid grid-cols-1 gap-2">
          <FacebookPublishButton listing={listing} />
          <InstagramPublishButton listing={listing} />
        </div>
      </CardFooter>
    </Card>
  );
};
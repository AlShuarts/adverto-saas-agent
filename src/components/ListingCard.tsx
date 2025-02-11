
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { ListingImageCarousel } from "./ListingImageCarousel";
import { FacebookPublishButton } from "./FacebookPublishButton";
import { InstagramPublishButton } from "./InstagramPublishButton";
import { formatPrice } from "@/utils/priceFormatter";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Share, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, videoUrl } = useSlideshow({ 
    listing,
    images: listing.images || []
  });

  const handleOpenPreview = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePublishAttempt = () => {
    toast({
      title: "Connexion requise",
      description: "Connectez votre page Facebook depuis votre profil pour publier sur Facebook/Instagram",
    });
  };

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

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
          {profile?.facebook_page_id ? (
            <>
              <FacebookPublishButton listing={listing} />
              <InstagramPublishButton listing={listing} />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPreview}
              className="w-full"
              disabled={isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? "Génération en cours..." : "Générer une publicité"}
            </Button>
          )}
        </div>
      </CardFooter>

      <SlideshowPreviewDialog
        isOpen={isOpen}
        onClose={handleClose}
        onPublish={handlePublishAttempt}
        isPublishing={false}
        listing={listing}
        musicUrl="/background-music.mp3"
      />
    </Card>
  );
};

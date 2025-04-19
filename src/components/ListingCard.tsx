
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { ListingImageCarousel } from "./ListingImageCarousel";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";
import { ListingDetails } from "./ListingDetails";
import { ListingPublishToggle } from "./ListingPublishToggle";
import { ActionSelectionDialog } from "./action-selection/ActionSelectionDialog";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  const [showActionsDialog, setShowActionsDialog] = useState(false);

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <ListingImageCarousel images={listing.images || []} />
        <ListingDetails listing={listing} />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2 w-full">
        <ListingPublishToggle listing={listing} />
        
        <div className="w-full grid grid-cols-1 gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowActionsDialog(true)}
            className="w-full"
          >
            <ListChecks className="w-4 h-4 mr-2" />
            Effectuer des actions
          </Button>
        </div>
      </CardFooter>

      <ActionSelectionDialog
        listing={listing}
        isOpen={showActionsDialog}
        onClose={() => setShowActionsDialog(false)}
      />
    </Card>
  );
};


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CreateSoldBannerDialog } from "./CreateSoldBannerDialog";
import { SoldBannerStatus } from "./SoldBannerStatus";

type CreateSoldBannerButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSoldBannerButton = ({ listing }: CreateSoldBannerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSoldBanner = () => {
    setIsOpen(true);
  };

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        <SoldBannerStatus listing={listing} />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateSoldBanner}
          disabled={isLoading}
          className="w-full"
        >
          <Tag className="w-4 h-4 mr-2" />
          Créer une bannière "VENDU"
        </Button>

        <CreateSoldBannerDialog
          listing={listing}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </>
  );
};

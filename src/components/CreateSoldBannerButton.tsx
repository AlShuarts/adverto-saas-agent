
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CreateSoldBannerDialog } from "./CreateSoldBannerDialog";

type CreateSoldBannerButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSoldBannerButton = ({ listing }: CreateSoldBannerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateBanner = () => {
    setIsOpen(true);
  };

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateBanner}
        disabled={isLoading}
        className="w-full"
      >
        <Tag className="w-4 h-4 mr-2" />
        Créer une bannière
      </Button>

      <CreateSoldBannerDialog
        listing={listing}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

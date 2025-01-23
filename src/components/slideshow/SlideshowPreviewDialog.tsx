import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlideshowPlayer } from "./SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";

type SlideshowPreviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  isPublishing: boolean;
  listing: Tables<"listings">;
  musicUrl: string | null;
};

export const SlideshowPreviewDialog = ({
  isOpen,
  onClose,
  onPublish,
  isPublishing,
  listing,
  musicUrl,
}: SlideshowPreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>Prévisualisation du diaporama</DialogTitle>
        <div className="space-y-4">
          {listing.images && (
            <SlideshowPlayer
              images={listing.images}
              musicUrl={musicUrl}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onPublish} disabled={isPublishing}>
            {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
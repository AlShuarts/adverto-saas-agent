import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
}: SlideshowPreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>Prévisualisation de la vidéo</DialogTitle>
        <div className="space-y-4">
          {listing.videoUrl && (
            <video 
              controls 
              className="w-full aspect-video"
              src={listing.videoUrl}
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onPublish} disabled={isPublishing || !listing.videoUrl}>
            {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
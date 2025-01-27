import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlideshowPlayer } from "./SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type SlideshowPreviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string) => void;
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
  const { generatedText, isLoading, error } = useListingText(listing, isOpen);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

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
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Message de la publication</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[150px]"
                placeholder="Entrez votre texte ici..."
              />
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => onPublish(editedText)} disabled={isPublishing}>
            {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
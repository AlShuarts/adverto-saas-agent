import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlideshowPlayer } from "./SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";
import { Download } from "lucide-react";

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
  const handleDownload = async () => {
    if (listing.video_url) {
      try {
        // Parse l'URL de la vidéo si elle est stockée comme une chaîne JSON
        const videoUrl = listing.video_url.startsWith('[') 
          ? JSON.parse(listing.video_url)[0]
          : listing.video_url;

        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diaporama-${listing.id}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
      }
    }
  };

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
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            {listing.video_url && (
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            )}
          </div>
          <Button onClick={onPublish} disabled={isPublishing}>
            {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
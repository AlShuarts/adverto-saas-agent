import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SlideshowPlayer } from "./SlideshowPlayer";
import { MusicSelector } from "./MusicSelector";
import { BackgroundMusic } from "./backgroundMusic";

type SlideshowPreviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string) => Promise<boolean>;
  isPublishing: boolean;
  listing: Tables<"listings">;
  musicUrl?: string;
};

export const SlideshowPreviewDialog = ({
  isOpen,
  onClose,
  onPublish,
  isPublishing,
  listing,
  musicUrl,
}: SlideshowPreviewDialogProps) => {
  const [message, setMessage] = useState(`🏠 ${listing.title}\n\n${listing.description || ""}\n\n💰 ${listing.price ? new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(listing.price) : "Prix sur demande"}`);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(musicUrl || null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePublish = async () => {
    const success = await onPublish(message);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Prévisualiser et publier le diaporama</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {listing.images && (
              <SlideshowPlayer
                images={listing.images}
                musicUrl={selectedMusic}
                isPlaying={isPlaying}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
              />
            )}
          </div>

          <div className="grid gap-4">
            <MusicSelector
              musics={[
                { id: "music-1", name: "Musique 1", url: "/background-music.mp3" },
                { id: "music-2", name: "Musique 2", url: "/background-music-2.mp3" },
              ]}
              selectedMusic={selectedMusic}
              onMusicChange={setSelectedMusic}
            />

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message de la publication
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
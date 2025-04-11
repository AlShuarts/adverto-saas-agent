
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlideshowPlayer } from "./SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Facebook, Instagram } from "lucide-react";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { supabase } from "@/integrations/supabase/client";

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
  const [isPublishingToInstagram, setIsPublishingToInstagram] = useState(false);

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  const handleInstagramPublish = async () => {
    try {
      setIsPublishingToInstagram(true);
      
      // Récupérer l'URL de la vidéo du diaporama
      const { data: slideshowData } = await supabase
        .from("slideshow_renders")
        .select("video_url")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const videoUrl = slideshowData?.video_url;

      if (!videoUrl) {
        throw new Error("URL de la vidéo non disponible");
      }

      // Incrémenter les statistiques pour Instagram
      await ensureAndIncrementStatistic('instagram');
      
      const { error } = await supabase.functions.invoke('instagram-publish', {
        body: {
          message: editedText,
          images: [videoUrl], // Nous passons l'URL de la vidéo comme image (l'API Instagram traitera la première comme une vidéo si c'est une URL de vidéo)
          listingId: listing.id
        },
      });
      
      if (error) {
        throw error;
      }
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de la publication sur Instagram:", error);
    } finally {
      setIsPublishingToInstagram(false);
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
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Annuler
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => onPublish(editedText)} 
              disabled={isPublishing || isPublishingToInstagram}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
              {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
            </Button>
            <Button 
              onClick={handleInstagramPublish} 
              disabled={isPublishing || isPublishingToInstagram}
              variant="secondary"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isPublishingToInstagram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}
              {isPublishingToInstagram ? "Publication en cours..." : "Publier sur Instagram"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { InstagramPreviewContent } from "./InstagramPreviewContent";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";

type InstagramPreviewProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string, selectedImages: string[]) => void;
};

export const InstagramPreview = ({
  listing,
  isOpen,
  onClose,
  onPublish,
}: InstagramPreviewProps) => {
  const { generatedText, isLoading, error } = useListingText(listing, isOpen);
  const [editedText, setEditedText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const displayImages = listing.images ? listing.images.slice(0, 10) : [];

  // Réinitialiser le texte quand le texte généré change
  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  // Réinitialiser les images sélectionnées uniquement à l'ouverture de la modal
  useEffect(() => {
    if (isOpen && displayImages.length > 0) {
      setSelectedImages([displayImages[0]]);
    }
  }, [isOpen]); // Ne dépend que de isOpen

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prévisualisation Instagram</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <InstagramPreviewContent
            isLoading={isLoading}
            error={error}
            generatedText={editedText}
            images={displayImages}
            onTextChange={setEditedText}
            selectedImages={selectedImages}
            onSelectedImagesChange={setSelectedImages}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={() => onPublish(editedText, selectedImages)}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              disabled={isLoading || selectedImages.length === 0}
            >
              Publier
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
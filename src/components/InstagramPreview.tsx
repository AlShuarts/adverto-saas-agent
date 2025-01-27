import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { InstagramPreviewContent } from "./InstagramPreviewContent";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";

type InstagramPreviewProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string) => void;
};

export const InstagramPreview = ({
  listing,
  isOpen,
  onClose,
  onPublish,
}: InstagramPreviewProps) => {
  const { generatedText, isLoading, error } = useListingText(listing, isOpen);
  const [editedText, setEditedText] = useState("");
  const displayImages = listing.images ? listing.images.slice(0, 10) : [];

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

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
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={() => onPublish(editedText)}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              disabled={isLoading}
            >
              Publier
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
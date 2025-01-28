import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { FacebookPreviewContent } from "./FacebookPreviewContent";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";

type FacebookPreviewProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string) => void;
  selectedTemplateId: string;
};

export const FacebookPreview = ({
  listing,
  isOpen,
  onClose,
  onPublish,
  selectedTemplateId,
}: FacebookPreviewProps) => {
  const { generatedText, isLoading, error } = useListingText(listing, isOpen, selectedTemplateId === "none" ? undefined : selectedTemplateId);
  const [editedText, setEditedText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const displayImages = listing.images || [];

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prévisualisation Facebook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FacebookPreviewContent
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
              onClick={() => onPublish(editedText)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
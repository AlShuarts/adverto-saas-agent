import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { InstagramPreviewContent } from "./InstagramPreviewContent";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
  const [isPublishing, setIsPublishing] = useState(false);
  const displayImages = listing.images || [];

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  useEffect(() => {
    if (isOpen && displayImages.length > 0) {
      setSelectedImages([displayImages[0]]);
    }
  }, [isOpen]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(editedText, selectedImages);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto h-[90vh] overflow-y-auto">
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
              disabled={isPublishing}
            >
              Annuler
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              disabled={isLoading || selectedImages.length === 0 || isPublishing}
            >
              {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
              Publier
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { FacebookPreviewContent } from "./FacebookPreviewContent";
import { useListingText } from "@/hooks/useListingText";

type FacebookPreviewProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string) => void;
};

export const FacebookPreview = ({
  listing,
  isOpen,
  onClose,
  onPublish,
}: FacebookPreviewProps) => {
  const { generatedText, isLoading, error } = useListingText(listing, isOpen);
  const displayImages = listing.images ? listing.images.slice(0, 2) : [];

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
            generatedText={generatedText}
            images={displayImages}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={() => onPublish(generatedText)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
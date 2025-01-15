import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { formatPrice } from "@/utils/priceFormatter";

type FacebookPreviewProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
};

export const FacebookPreview = ({
  listing,
  isOpen,
  onClose,
  onPublish,
}: FacebookPreviewProps) => {
  const message = `${listing.title}\n\n${listing.description || ""}\n\nPrix: ${
    listing.price
      ? formatPrice(listing.price)
      : "Prix sur demande"
  }\n\n${[listing.address, listing.city].filter(Boolean).join(", ")}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prévisualisation Facebook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-white">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full" />
              <div>
                <p className="font-semibold">Votre Page Facebook</p>
                <p className="text-sm text-gray-500">Maintenant</p>
              </div>
            </div>
            <p className="whitespace-pre-line mb-4">{message}</p>
            {listing.images && listing.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {listing.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={onPublish}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Publier
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
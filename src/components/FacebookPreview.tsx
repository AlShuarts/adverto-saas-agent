import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateText = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-listing-description', {
          body: { listing },
        });

        if (error) throw error;
        setGeneratedText(data.text);
      } catch (err) {
        console.error('Error generating text:', err);
        setError("Impossible de générer le texte de vente. Le texte par défaut sera utilisé.");
        setGeneratedText(`${listing.title}\n\n${listing.description || ""}\n\nPlus de détails sur Centris: https://www.centris.ca/${listing.centris_id}`);
      } finally {
        setIsLoading(false);
      }
    };

    generateText();
  }, [isOpen, listing]);

  // Limit to first 2 images
  const displayImages = listing.images ? listing.images.slice(0, 2) : [];

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
                <p className="font-semibold text-gray-900">Votre Page Facebook</p>
                <p className="text-sm text-gray-500">Maintenant</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                <p className="whitespace-pre-line mb-4 text-gray-900">{generatedText}</p>
                {error && (
                  <p className="text-sm text-red-500 mb-4">{error}</p>
                )}
                {displayImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {displayImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </>
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
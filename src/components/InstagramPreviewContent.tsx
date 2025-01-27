import { Tables } from "@/integrations/supabase/types";
import { Loader2, Instagram } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type InstagramPreviewContentProps = {
  isLoading: boolean;
  error: string | null;
  generatedText: string;
  images: string[];
  onTextChange: (text: string) => void;
  selectedImages: string[];
  onSelectedImagesChange: (images: string[]) => void;
};

export const InstagramPreviewContent = ({
  isLoading,
  error,
  generatedText,
  images,
  onTextChange,
  selectedImages,
  onSelectedImagesChange,
}: InstagramPreviewContentProps) => {
  const handleImageSelect = (image: string) => {
    console.log("Image sélectionnée:", image);
    console.log("Images actuellement sélectionnées:", selectedImages);
    
    const isSelected = selectedImages.includes(image);
    
    if (isSelected) {
      const newSelection = selectedImages.filter((i) => i !== image);
      console.log("Nouvelle sélection après retrait:", newSelection);
      onSelectedImagesChange(newSelection);
    } else if (selectedImages.length < 10) {
      const newSelection = [...selectedImages, image];
      console.log("Nouvelle sélection après ajout:", newSelection);
      onSelectedImagesChange(newSelection);
    }
  };

  return (
    <div className="glass border border-border/40 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700 rounded-full flex items-center justify-center">
          <Instagram className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Votre Compte Instagram</p>
          <p className="text-sm text-muted-foreground">Maintenant</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {images.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full aspect-square object-cover rounded"
                    />
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedImages.includes(image)}
                        onCheckedChange={() => handleImageSelect(image)}
                        disabled={!selectedImages.includes(image) && selectedImages.length >= 10}
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
                      {index + 1}/{images.length}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedImages.length}/10 images sélectionnées
              </p>
            </>
          )}
          <Textarea
            value={generatedText}
            onChange={(e) => onTextChange(e.target.value)}
            className="min-h-[150px]"
            placeholder="Entrez votre texte ici..."
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
};
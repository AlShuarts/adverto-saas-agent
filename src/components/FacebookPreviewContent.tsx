import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

type FacebookPreviewContentProps = {
  isLoading: boolean;
  error: string | null;
  generatedText: string;
  images: string[];
  onTextChange: (text: string) => void;
  selectedImages: string[];
  onSelectedImagesChange: (images: string[]) => void;
};

export const FacebookPreviewContent = ({
  isLoading,
  error,
  generatedText,
  images,
  onTextChange,
  selectedImages,
  onSelectedImagesChange,
}: FacebookPreviewContentProps) => {
  const handleImageSelect = (image: string) => {
    console.log("Image sélectionnée:", image);
    console.log("Images actuellement sélectionnées:", selectedImages);
    
    const isSelected = selectedImages.includes(image);
    
    if (isSelected) {
      const newSelection = selectedImages.filter((i) => i !== image);
      console.log("Nouvelle sélection après retrait:", newSelection);
      onSelectedImagesChange(newSelection);
    } else {
      const newSelection = [...selectedImages, image];
      console.log("Nouvelle sélection après ajout:", newSelection);
      onSelectedImagesChange(newSelection);
    }
  };

  return (
    <div className="glass border border-border/40 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full" />
        <div>
          <p className="font-semibold text-foreground">Votre Page Facebook</p>
          <p className="text-sm text-muted-foreground">Maintenant</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <Textarea
            value={generatedText}
            onChange={(e) => onTextChange(e.target.value)}
            className="mb-4 min-h-[150px]"
            placeholder="Entrez votre texte ici..."
          />
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          {images.length > 0 && (
            <>
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedImages.includes(image)}
                          onCheckedChange={() => handleImageSelect(image)}
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
                        {index + 1}/{images.length}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-sm text-muted-foreground mt-4">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} sélectionnée{selectedImages.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};

import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Images } from "lucide-react";
import { SelectAllButton } from "./SelectAllButton";

export type ImageSelectionProps = {
  selectedImages: string[];
  toggleImageSelection: (imageUrl: string) => void;
  availableImages?: string[];
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
};

export const ImageSelection = ({
  selectedImages,
  toggleImageSelection,
  availableImages,
  onSelectAll,
  onDeselectAll
}: ImageSelectionProps) => {
  // If availableImages is not provided, we'll just show the selected images
  const imagesToDisplay = availableImages || selectedImages;
  
  const handleSelectAll = () => {
    if (onSelectAll && availableImages) {
      onSelectAll();
    }
  };

  const handleDeselectAll = () => {
    if (onDeselectAll) {
      onDeselectAll();
    }
  };

  if (!imagesToDisplay || imagesToDisplay.length === 0) {
    return <div className="space-y-4">
        <h5 className="text-sm font-medium">Sélection des photos</h5>
        <div className="flex flex-col items-center justify-center h-[220px] border rounded p-8 text-center">
          <Images className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune image disponible</p>
          <p className="text-sm text-muted-foreground mt-2">Veuillez ajouter des images à cette propriété</p>
        </div>
      </div>;
  }

  return <div className="space-y-4 w-full">
      <h5 className="font-medium text-lg">Sélection des photos</h5>
      
      {availableImages && onSelectAll && onDeselectAll && (
        <SelectAllButton
          availableImages={availableImages}
          selectedImages={selectedImages}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      )}
      
      <ScrollArea className="h-[220px] border rounded p-2 w-full">
        <div className="grid grid-cols-2 gap-2">
          {imagesToDisplay.map((image, index) => <div key={index} className="relative cursor-pointer rounded-md overflow-hidden group" onClick={() => toggleImageSelection(image)}>
              <img src={image} alt={`Image ${index + 1}`} className="w-full h-24 object-cover" />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${selectedImages.includes(image) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                {selectedImages.includes(image) && <Check className="text-white h-6 w-6" />}
              </div>
            </div>)}
        </div>
      </ScrollArea>
      
      <div className="mt-2">
        <p className="text-sm text-muted-foreground">
          {selectedImages.length} images sélectionnées
        </p>
      </div>
    </div>;
};

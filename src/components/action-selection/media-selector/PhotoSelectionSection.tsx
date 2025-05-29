
import { Check, Images } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectAllButton } from "../media-generation/components/SelectAllButton";

type PhotoSelectionSectionProps = {
  images: string[];
  selectedImages: string[];
  toggleImageSelection: (imageUrl: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
};

export const PhotoSelectionSection = ({
  images,
  selectedImages,
  toggleImageSelection,
  onSelectAll,
  onDeselectAll
}: PhotoSelectionSectionProps) => {
  if (!images || images.length === 0) {
    return (
      <Card className="p-4">
        <h4 className="text-base font-medium mb-4">Sélection des photos</h4>
        <div className="flex flex-col items-center justify-center h-[220px] bg-muted/20 rounded p-8 text-center">
          <Images className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune image disponible</p>
          <p className="text-sm text-muted-foreground mt-2">Veuillez ajouter des images à cette propriété</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h4 className="text-base font-medium">Sélection des photos</h4>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les photos à utiliser pour votre publication.
        </p>
        
        {onSelectAll && onDeselectAll && (
          <SelectAllButton
            availableImages={images}
            selectedImages={selectedImages}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
          />
        )}
        
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative cursor-pointer group aspect-square"
                onClick={() => toggleImageSelection(image)}
              >
                <img 
                  src={image} 
                  alt={`Image ${index + 1}`} 
                  className="w-full h-full object-cover rounded-md"
                />
                <div 
                  className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                    selectedImages.includes(image) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                  }`}
                >
                  {selectedImages.includes(image) && <Check className="text-white h-6 w-6" />}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            {selectedImages.length} images sélectionnées sur {images.length}
          </p>
        </div>
      </div>
    </Card>
  );
};

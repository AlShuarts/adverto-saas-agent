
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

export type ImageSelectionProps = {
  selectedImages: string[];
  toggleImageSelection: (imageUrl: string) => void;
  availableImages?: string[]; // Allow for passing available images
};

export const ImageSelection = ({ 
  selectedImages,
  toggleImageSelection,
  availableImages
}: ImageSelectionProps) => {
  // If availableImages is not provided, we'll just show the selected images
  const imagesToDisplay = availableImages || selectedImages;
  
  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium">Photos pour le diaporama</h5>
      <ScrollArea className="h-[220px]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {imagesToDisplay.map((image, index) => (
            <div 
              key={index}
              className="relative cursor-pointer rounded-md overflow-hidden group"
              onClick={() => toggleImageSelection(image)}
            >
              <img 
                src={image} 
                alt={`Image ${index + 1}`} 
                className="w-full h-24 object-cover"
              />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${selectedImages.includes(image) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                {selectedImages.includes(image) && (
                  <Check className="text-white h-6 w-6" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

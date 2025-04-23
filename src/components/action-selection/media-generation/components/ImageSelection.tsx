
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "@/components/ui/image";
import { Check } from "lucide-react";

export type ImageSelectionProps = {
  selectedImages: string[];
  toggleImageSelection: (imageUrl: string) => void;
};

export const ImageSelection = ({ 
  selectedImages,
  toggleImageSelection
}: ImageSelectionProps) => {
  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium">Photos sélectionnées</h5>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {selectedImages.map((image, index) => (
          <div 
            key={index}
            className="relative cursor-pointer rounded-md overflow-hidden group"
            onClick={() => toggleImageSelection(image)}
          >
            <img 
              src={image} 
              alt={`Selected image ${index + 1}`} 
              className="w-full h-24 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100">
              <Check className="text-white h-6 w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

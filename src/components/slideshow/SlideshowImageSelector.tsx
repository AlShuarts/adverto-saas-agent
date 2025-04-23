
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

type SlideshowImageSelectorProps = {
  images: string[];
  selectedImages: string[];
  onImageSelect: (imageUrl: string) => void;
};

export const SlideshowImageSelector = ({
  images,
  selectedImages,
  onImageSelect
}: SlideshowImageSelectorProps) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Images disponibles</h4>
          <div className="grid grid-cols-2 gap-2 border rounded-lg p-2">
            {images?.map(imageUrl => (
              <div key={imageUrl} className="relative group">
                <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Checkbox 
                    checked={selectedImages.includes(imageUrl)} 
                    onCheckedChange={() => onImageSelect(imageUrl)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

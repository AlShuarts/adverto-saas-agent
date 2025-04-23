
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type PhotoSelectionSectionProps = {
  images: string[];
  selectedImages: string[];
  toggleImageSelection: (imageUrl: string) => void;
};

export const PhotoSelectionSection = ({ 
  images, 
  selectedImages, 
  toggleImageSelection 
}: PhotoSelectionSectionProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium">Sélection des photos</h4>
      <ScrollArea className="h-[260px] border rounded-lg p-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
          {images?.map(imageUrl => (
            <div key={imageUrl} className="relative group">
              <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
              <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${selectedImages.includes(imageUrl) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <Checkbox 
                  checked={selectedImages.includes(imageUrl)} 
                  onCheckedChange={() => toggleImageSelection(imageUrl)} 
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

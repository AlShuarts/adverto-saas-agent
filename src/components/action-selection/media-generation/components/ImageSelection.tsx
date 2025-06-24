
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type ImageSelectionProps = {
  selectedImages: string[];
  toggleImageSelection: (imageUrl: string) => void;
  availableImages: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
};

export const ImageSelection = ({
  selectedImages,
  toggleImageSelection,
  availableImages,
  onSelectAll,
  onDeselectAll
}: ImageSelectionProps) => {
  const isMobile = useIsMobile();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  const validImages = availableImages.filter(img => !imageErrors.has(img));
  const allSelected = validImages.length > 0 && selectedImages.length === validImages.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={allSelected ? "secondary" : "outline"}
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className={isMobile ? "text-xs px-3 py-1" : "text-sm"}
          >
            {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </Button>
        </div>
        <span className={`${isMobile ? "text-xs" : "text-sm"} text-gray-400`}>
          {selectedImages.length} / {validImages.length} sélectionnées
        </span>
      </div>

      {validImages.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Plus className="w-12 h-12 text-gray-500 mb-2" />
            <p className="text-gray-400 text-center">
              Aucune image disponible
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid ${
          isMobile 
            ? "grid-cols-2 gap-3" 
            : "grid-cols-3 lg:grid-cols-4 gap-4"
        }`}>
          {validImages.map((imageUrl, index) => {
            const isSelected = selectedImages.includes(imageUrl);
            
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 border-2 hover:scale-105 ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
                onClick={() => toggleImageSelection(imageUrl)}
              >
                <CardContent className="p-2">
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(imageUrl)}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className={`absolute top-2 right-2 ${
                      isSelected ? "bg-primary" : "bg-gray-800/80"
                    } rounded-full p-1`}>
                      <span className={`${isMobile ? "text-xs" : "text-sm"} text-white font-medium`}>
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};


import { Button } from "@/components/ui/button";
import { Tag, FileImage } from "lucide-react";
import { PhotoType } from "./types";
import { useActionSelection } from "./context/ActionSelectionContext";

type PhotoTypeSelectorProps = {
  selectedPhotoType: PhotoType | null;
  onPhotoTypeChange: (type: PhotoType) => void;
};

export const PhotoTypeSelector = ({
  selectedPhotoType,
  onPhotoTypeChange
}: PhotoTypeSelectorProps) => {
  const { nextStep } = useActionSelection();

  const handlePhotoTypeSelection = (type: PhotoType) => {
    onPhotoTypeChange(type);
    // Automatically advance to next step after a short delay
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant={selectedPhotoType === "banner" ? "default" : "outline"}
          className="h-auto p-6 justify-start"
          onClick={() => handlePhotoTypeSelection("banner")}
        >
          <div className="flex items-center space-x-3">
            <Tag className="w-6 h-6" />
            <span className="text-lg">Bannière "Vendu" ou "À vendre"</span>
          </div>
        </Button>
        
        <Button
          variant={selectedPhotoType === "listing_photos" ? "default" : "outline"}
          className="h-auto p-6 justify-start"
          onClick={() => handlePhotoTypeSelection("listing_photos")}
        >
          <div className="flex items-center space-x-3">
            <FileImage className="w-6 h-6" />
            <span className="text-lg">Photos de l'annonce</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

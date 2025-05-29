
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tag, FileImage } from "lucide-react";
import { PhotoType } from "./types";

type PhotoTypeSelectorProps = {
  selectedPhotoType: PhotoType | null;
  onPhotoTypeChange: (type: PhotoType) => void;
};

export const PhotoTypeSelector = ({
  selectedPhotoType,
  onPhotoTypeChange
}: PhotoTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="photo-banner" 
              checked={selectedPhotoType === "banner"} 
              onCheckedChange={() => onPhotoTypeChange("banner")} 
            />
            <div className="space-y-2">
              <Label htmlFor="photo-banner" className="flex items-center cursor-pointer">
                <Tag className="w-4 h-4 mr-2" />
                Bannière "Vendu" ou "À vendre"
              </Label>
              <p className="text-sm text-muted-foreground">
                Créez une bannière professionnelle avec les informations du courtier.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="photo-listing" 
              checked={selectedPhotoType === "listing_photos"} 
              onCheckedChange={() => onPhotoTypeChange("listing_photos")} 
            />
            <div className="space-y-2">
              <Label htmlFor="photo-listing" className="flex items-center cursor-pointer">
                <FileImage className="w-4 h-4 mr-2" />
                Photos de l'annonce
              </Label>
              <p className="text-sm text-muted-foreground">
                Utilisez directement les photos de votre annonce immobilière.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

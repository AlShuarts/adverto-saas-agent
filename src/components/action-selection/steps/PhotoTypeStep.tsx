
import { PhotoTypeSelector } from "../PhotoTypeSelector";
import { PhotoType } from "../types";

type PhotoTypeStepProps = {
  selectedPhotoType: PhotoType | null;
  onPhotoTypeChange: (type: PhotoType) => void;
};

export const PhotoTypeStep = ({
  selectedPhotoType,
  onPhotoTypeChange
}: PhotoTypeStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 2: Choisir le type de contenu photo</h3>
      <PhotoTypeSelector
        selectedPhotoType={selectedPhotoType}
        onPhotoTypeChange={onPhotoTypeChange}
      />
    </div>
  );
};

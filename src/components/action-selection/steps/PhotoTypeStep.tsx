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
  return <div className="space-y-6">
      
      <PhotoTypeSelector selectedPhotoType={selectedPhotoType} onPhotoTypeChange={onPhotoTypeChange} />
    </div>;
};
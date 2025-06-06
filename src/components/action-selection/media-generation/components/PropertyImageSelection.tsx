
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";

type PropertyImageSelectionProps = {
  selectedImages: string[];
  bannerImage: string | null;
  selectBannerImage: (imageUrl: string) => void;
  formErrors: { [key: string]: string };
  setFormErrors: (errors: { [key: string]: string }) => void;
};

export const PropertyImageSelection = ({
  selectedImages,
  bannerImage,
  selectBannerImage,
  formErrors,
  setFormErrors
}: PropertyImageSelectionProps) => {
  return (
    <div className="space-y-2 border rounded-md p-4 bg-muted/30">
      <h3 className="text-base font-medium">Sélection de l'image pour la bannière</h3>
      {selectedImages && selectedImages.length > 0 ? (
        <PropertyImageSelector 
          images={selectedImages} 
          selectedImage={bannerImage || ""} 
          setSelectedImage={selectBannerImage} 
          formErrors={formErrors} 
          setFormErrors={setFormErrors} 
        />
      ) : (
        <div className="text-center p-4 bg-card/50 rounded-md border border-dashed">
          <p className="text-muted-foreground">
            Aucune image disponible. Veuillez sélectionner des images à l'étape précédente.
          </p>
        </div>
      )}
    </div>
  );
};

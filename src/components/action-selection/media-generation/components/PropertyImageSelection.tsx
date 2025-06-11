
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";

type PropertyImageSelectionProps = {
  selectedImages: string[];
  bannerImage: string | null;
  selectBannerImage: (imageUrl: string) => void;
  formErrors: { [key: string]: string };
  setFormErrors: (errors: { [key: string]: string }) => void;
  listingImages?: string[];
};

export const PropertyImageSelection = ({
  selectedImages,
  bannerImage,
  selectBannerImage,
  formErrors,
  setFormErrors,
  listingImages = []
}: PropertyImageSelectionProps) => {
  // Use listing images if available, otherwise fall back to selected images
  const availableImages = listingImages.length > 0 ? listingImages : selectedImages;

  return (
    <div className="space-y-2 border rounded-md p-4 bg-muted/30">
      <h3 className="text-base font-medium">Sélection de l'image pour la bannière</h3>
      {availableImages && availableImages.length > 0 ? (
        <PropertyImageSelector 
          images={availableImages} 
          selectedImage={bannerImage || ""} 
          setSelectedImage={selectBannerImage} 
          formErrors={formErrors} 
          setFormErrors={setFormErrors} 
        />
      ) : (
        <div className="text-center p-4 bg-card/50 rounded-md border border-dashed">
          <p className="text-muted-foreground">
            Aucune image disponible pour ce listing.
          </p>
        </div>
      )}
    </div>
  );
};

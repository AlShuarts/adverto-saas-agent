
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ImageSelectionProps = {
  images: string[];
  selectedImage?: string | null;
  selectedImages?: string[];
  onSelectImage?: (imageUrl: string) => void;
  toggleImageSelection?: (imageUrl: string) => void;
  formErrors?: {[key: string]: string};
  setFormErrors?: (errors: {[key: string]: string}) => void;
};

export const ImageSelection = ({ 
  images, 
  selectedImage, 
  selectedImages = [],
  onSelectImage, 
  toggleImageSelection,
  formErrors = {},
  setFormErrors 
}: ImageSelectionProps) => {
  // Determine which selection handler to use
  const handleSelection = (imageUrl: string) => {
    if (toggleImageSelection) {
      toggleImageSelection(imageUrl);
    } else if (onSelectImage) {
      onSelectImage(imageUrl);
      
      if (formErrors?.bannerImage && setFormErrors) {
        const { bannerImage, ...rest } = formErrors;
        setFormErrors(rest);
      }
    }
  };
  
  // Determine if an image is selected
  const isSelected = (imageUrl: string) => {
    if (selectedImages && selectedImages.length > 0) {
      return selectedImages.includes(imageUrl);
    }
    return selectedImage === imageUrl;
  };

  return (
    <div className="space-y-2">
      {images && images.length > 0 ? (
        <ScrollArea className={`h-[220px] border rounded-lg p-2 ${formErrors?.bannerImage ? "border-destructive" : "border-gray-700"}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
            {images.map((imageUrl) => (
              <div
                key={imageUrl}
                className={`relative cursor-pointer border-2 ${
                  isSelected(imageUrl) ? "border-primary" : "border-transparent"
                } rounded overflow-hidden transition-all hover:opacity-90`}
                onClick={() => handleSelection(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt="Property"
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Alert variant="destructive">
          <AlertDescription>
            Aucune image disponible. Veuillez d'abord ajouter des images.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

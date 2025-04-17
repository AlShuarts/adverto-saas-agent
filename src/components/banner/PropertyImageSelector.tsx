import { ScrollArea } from "@/components/ui/scroll-area";
import { FormError } from "./FormError";
import { ImageIcon, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PropertyImageSelectorProps = {
  images: string[];
  selectedImage: string;
  setSelectedImage: (image: string) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
};

export const PropertyImageSelector = ({
  images,
  selectedImage,
  setSelectedImage,
  formErrors,
  setFormErrors
}: PropertyImageSelectorProps) => {
  
  const handleSelectImage = (image: string) => {
    setSelectedImage(image);
    
    if (formErrors.selectedImage) {
      const { selectedImage, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };

  return (
    <div className="space-y-3">
      <Label className={`${formErrors.selectedImage ? "text-destructive flex items-center" : "flex items-center"}`}>
        <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        Sélectionnez une image pour la bannière *
      </Label>
      
      {images.length > 0 ? (
        <>
          {!selectedImage && (
            <Alert variant="default" className="bg-amber-50 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 text-xs">
                Veuillez sélectionner une image pour continuer
              </AlertDescription>
            </Alert>
          )}
          
          <ScrollArea className="h-[150px]">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pr-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer transition-all rounded-md overflow-hidden ${
                    selectedImage === image
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:opacity-90"
                  }`}
                  onClick={() => handleSelectImage(image)}
                >
                  <div className="aspect-video">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <FormError error={formErrors.selectedImage} />
        </>
      ) : (
        <div className="text-center p-4 bg-muted/20 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">
            Aucune image disponible. Veuillez d'abord sélectionner des images à l'étape précédente.
          </p>
        </div>
      )}
    </div>
  );
};


import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormError } from "./FormError";

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
  return (
    <div className="grid gap-2">
      <Label htmlFor="propertyImage" className={formErrors.selectedImage ? "text-destructive" : ""}>
        Image de la propriété *
      </Label>
      <Select 
        value={selectedImage} 
        onValueChange={(value) => {
          setSelectedImage(value);
          if (formErrors.selectedImage) {
            const { selectedImage, ...rest } = formErrors;
            setFormErrors(rest);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez une image" />
        </SelectTrigger>
        <SelectContent>
          {images?.map((image, index) => (
            <SelectItem key={index} value={image}>
              Image {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <FormError error={formErrors.selectedImage} />
      
      {selectedImage && (
        <div className="aspect-video overflow-hidden rounded-md mt-2">
          <img
            src={selectedImage}
            alt="Image sélectionnée"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

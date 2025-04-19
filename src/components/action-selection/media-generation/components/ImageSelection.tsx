
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ImageSelectionProps = {
  images: string[];
  selectedImage: string | null;
  onSelectImage: (imageUrl: string) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
};

export const ImageSelection = ({ 
  images, 
  selectedImage, 
  onSelectImage, 
  formErrors,
  setFormErrors 
}: ImageSelectionProps) => {
  return (
    <div className="space-y-2 border rounded-md p-4 bg-gray-800">
      <h3 className="text-base font-medium text-white">Image de propriété</h3>
      {images && images.length > 0 ? (
        <ScrollArea className={`h-[220px] border rounded-lg p-2 ${formErrors.bannerImage ? "border-destructive" : "border-gray-700"}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
            {images.map((imageUrl) => (
              <div
                key={imageUrl}
                className={`relative cursor-pointer border-2 ${
                  selectedImage === imageUrl ? "border-primary" : "border-transparent"
                } rounded overflow-hidden transition-all hover:opacity-90`}
                onClick={() => {
                  onSelectImage(imageUrl);
                  if (formErrors.bannerImage) {
                    const { bannerImage, ...rest } = formErrors;
                    setFormErrors(rest);
                  }
                }}
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

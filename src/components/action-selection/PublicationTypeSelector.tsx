
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, FileImage, Tag } from "lucide-react";

type PublicationType = "photo" | "slideshow" | "banner";

type PublicationTypeSelectorProps = {
  selectedPublicationTypes: PublicationType[];
  onPublicationTypeChange: (type: PublicationType, checked: boolean) => void;
};

export const PublicationTypeSelector = ({ 
  selectedPublicationTypes, 
  onPublicationTypeChange 
}: PublicationTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 1: Choisir le type de publication</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="publication-photo" 
              checked={selectedPublicationTypes.includes("photo")}
              onCheckedChange={(checked) => onPublicationTypeChange("photo", !!checked)}
            />
            <div className="space-y-2">
              <Label 
                htmlFor="publication-photo" 
                className="flex items-center cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                Texte avec Photo
              </Label>
              <p className="text-sm text-muted-foreground">
                Une publication simple avec du texte et des photos.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="publication-slideshow" 
              checked={selectedPublicationTypes.includes("slideshow")}
              onCheckedChange={(checked) => onPublicationTypeChange("slideshow", !!checked)}
            />
            <div className="space-y-2">
              <Label 
                htmlFor="publication-slideshow" 
                className="flex items-center cursor-pointer"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Texte avec Diaporama
              </Label>
              <p className="text-sm text-muted-foreground">
                Une publication avec un diaporama dynamique de vos photos.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="publication-banner" 
              checked={selectedPublicationTypes.includes("banner")}
              onCheckedChange={(checked) => onPublicationTypeChange("banner", !!checked)}
            />
            <div className="space-y-2">
              <Label 
                htmlFor="publication-banner" 
                className="flex items-center cursor-pointer"
              >
                <Tag className="w-4 h-4 mr-2" />
                Texte avec Bannière
              </Label>
              <p className="text-sm text-muted-foreground">
                Une publication avec une bannière "Vendu" ou "À vendre".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

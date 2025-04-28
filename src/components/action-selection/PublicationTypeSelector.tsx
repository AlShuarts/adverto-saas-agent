
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, FileImage, Tag } from "lucide-react";
import { useEffect } from "react";
import { PublicationType } from "./types";

type PublicationTypeSelectorProps = {
  selectedPublicationTypes: PublicationType[];
  onPublicationTypeChange: (type: PublicationType, checked: boolean) => void;
};

export const PublicationTypeSelector = ({ 
  selectedPublicationTypes, 
  onPublicationTypeChange 
}: PublicationTypeSelectorProps) => {
  // Log selected types when they change for debugging
  useEffect(() => {
    console.log("PublicationTypeSelector - Current selected types:", selectedPublicationTypes);
  }, [selectedPublicationTypes]);

  const handleCheckboxChange = (type: PublicationType, checked: boolean) => {
    console.log(`Checkbox change: ${type} -> ${checked}`);
    onPublicationTypeChange(type, checked);
  };

  // Helper function to handle container click
  const handleContainerClick = (type: PublicationType) => {
    const newCheckedState = !selectedPublicationTypes.includes(type);
    console.log(`Container click: ${type} -> ${newCheckedState}`);
    onPublicationTypeChange(type, newCheckedState);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all"
        onClick={() => handleContainerClick("photo")}
      >
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="publication-photo" 
            checked={selectedPublicationTypes.includes("photo")}
            onCheckedChange={(checked) => handleCheckboxChange("photo", !!checked)}
            onClick={(e) => e.stopPropagation()} // Prevent double trigger with container
          />
          <div className="space-y-2">
            <Label 
              htmlFor="publication-photo" 
              className="flex items-center cursor-pointer"
              onClick={(e) => e.stopPropagation()} // Prevent double trigger with container
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
      
      <div 
        className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all"
        onClick={() => handleContainerClick("slideshow")}
      >
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="publication-slideshow" 
            checked={selectedPublicationTypes.includes("slideshow")}
            onCheckedChange={(checked) => handleCheckboxChange("slideshow", !!checked)}
            onClick={(e) => e.stopPropagation()} // Prevent double trigger with container
          />
          <div className="space-y-2">
            <Label 
              htmlFor="publication-slideshow" 
              className="flex items-center cursor-pointer"
              onClick={(e) => e.stopPropagation()} // Prevent double trigger with container
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
      
      <div 
        className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all"
        onClick={() => handleContainerClick("banner")}
      >
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="publication-banner" 
            checked={selectedPublicationTypes.includes("banner")}
            onCheckedChange={(checked) => handleCheckboxChange("banner", !!checked)}
            onClick={(e) => e.stopPropagation()} // Prevent double trigger with container
          />
          <div className="space-y-2">
            <Label 
              htmlFor="publication-banner" 
              className="flex items-center cursor-pointer"
              onClick={(e) => e.stopPropagation()} // Prevent double trigger with container
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
  );
};

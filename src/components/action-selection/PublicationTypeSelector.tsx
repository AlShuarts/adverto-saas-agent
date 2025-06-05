
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, FileImage } from "lucide-react";
import { PublicationType } from "./types";
import { useActionSelection } from "./context/ActionSelectionContext";

type PublicationTypeSelectorProps = {
  selectedPublicationType: PublicationType | null;
  onPublicationTypeChange: (type: PublicationType) => void;
};

export const PublicationTypeSelector = ({
  selectedPublicationType,
  onPublicationTypeChange
}: PublicationTypeSelectorProps) => {
  const { nextStep } = useActionSelection();

  const handlePublicationTypeSelection = (type: PublicationType) => {
    onPublicationTypeChange(type);
    // Automatically advance to next step after a short delay
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="publication-photo" 
              checked={selectedPublicationType === "photo"} 
              onCheckedChange={() => handlePublicationTypeSelection("photo")} 
            />
            <div className="space-y-2">
              <Label htmlFor="publication-photo" className="flex items-center cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Publication avec Photos
              </Label>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="publication-slideshow" 
              checked={selectedPublicationType === "slideshow"} 
              onCheckedChange={() => handlePublicationTypeSelection("slideshow")} 
            />
            <div className="space-y-2">
              <Label htmlFor="publication-slideshow" className="flex items-center cursor-pointer">
                <FileImage className="w-4 h-4 mr-2" />
                Publication avec Diaporama
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

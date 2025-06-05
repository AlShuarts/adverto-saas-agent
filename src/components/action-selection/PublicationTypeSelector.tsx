
import { Button } from "@/components/ui/button";
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
        <Button
          variant={selectedPublicationType === "photo" ? "default" : "outline"}
          className="h-auto p-6 justify-start"
          onClick={() => handlePublicationTypeSelection("photo")}
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <span className="text-lg">Publication avec Photos</span>
          </div>
        </Button>
        
        <Button
          variant={selectedPublicationType === "slideshow" ? "default" : "outline"}
          className="h-auto p-6 justify-start"
          onClick={() => handlePublicationTypeSelection("slideshow")}
        >
          <div className="flex items-center space-x-3">
            <FileImage className="w-6 h-6" />
            <span className="text-lg">Publication avec Diaporama</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

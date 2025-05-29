
import { Button } from "@/components/ui/button";
import { Check, Square } from "lucide-react";

type SelectAllButtonProps = {
  availableImages: string[];
  selectedImages: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
};

export const SelectAllButton = ({
  availableImages,
  selectedImages,
  onSelectAll,
  onDeselectAll
}: SelectAllButtonProps) => {
  const allSelected = availableImages.length > 0 && selectedImages.length === availableImages.length;
  
  const handleToggleSelectAll = () => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  if (availableImages.length === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleSelectAll}
      className="mb-2"
    >
      {allSelected ? (
        <>
          <Square className="mr-2 h-4 w-4" />
          Désélectionner tout
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Sélectionner tout
        </>
      )}
    </Button>
  );
};

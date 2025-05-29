
import { PublicationTypeSelector } from "../PublicationTypeSelector";
import { PublicationType } from "../types";

type PublicationStepProps = {
  selectedPublicationType: PublicationType | null;
  onPublicationTypeChange: (type: PublicationType) => void;
};

export const PublicationStep = ({
  selectedPublicationType,
  onPublicationTypeChange
}: PublicationStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 1: Choisir le type de publication</h3>
      <PublicationTypeSelector
        selectedPublicationType={selectedPublicationType}
        onPublicationTypeChange={onPublicationTypeChange}
      />
    </div>
  );
};

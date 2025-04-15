
import { PublicationTypeSelector } from "../PublicationTypeSelector";
import { PublicationType } from "../types";

type PublicationStepProps = {
  selectedPublicationTypes: PublicationType[];
  onPublicationTypeChange: (type: PublicationType, checked: boolean) => void;
};

export const PublicationStep = ({
  selectedPublicationTypes,
  onPublicationTypeChange
}: PublicationStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 1: Choisir le type de publication</h3>
      <PublicationTypeSelector
        selectedPublicationTypes={selectedPublicationTypes}
        onPublicationTypeChange={onPublicationTypeChange}
      />
    </div>
  );
};

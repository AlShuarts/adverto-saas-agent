
import { SocialNetworkSelector } from "../SocialNetworkSelector";
import { PublicationType, SocialNetworks } from "../types";
import { Button } from "@/components/ui/button";

type SocialStepProps = {
  selectedPublicationTypes: PublicationType[];
  selectedNetworks: SocialNetworks;
  setSelectedNetworks: (networks: SocialNetworks) => void;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
  hasRequiredInfo: boolean;
};

export const SocialStep = ({ 
  selectedPublicationTypes, 
  selectedNetworks,
  setSelectedNetworks,
  isSubmitting,
  onSubmit,
  hasRequiredInfo
}: SocialStepProps) => {
  // Handle network change
  const handleNetworkChange = (network: keyof SocialNetworks, checked: boolean) => {
    setSelectedNetworks({
      ...selectedNetworks,
      [network]: checked
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 5: Publier sur les réseaux sociaux</h3>
      
      <div className="space-y-4 border rounded-md p-4">
        <h4 className="font-medium">Sélection des réseaux</h4>
        <p className="text-sm text-muted-foreground">
          Choisissez les réseaux sociaux sur lesquels vous souhaitez publier votre contenu.
        </p>
        
        <SocialNetworkSelector 
          selectedNetworks={selectedNetworks}
          onNetworkChange={handleNetworkChange}
        />
        
        <Button 
          type="button" 
          onClick={onSubmit}
          disabled={
            isSubmitting || 
            !hasRequiredInfo || 
            (!selectedNetworks.facebook && !selectedNetworks.instagram)
          }
          className="w-full sm:w-auto mt-4"
        >
          {isSubmitting ? "Publication en cours..." : "Publier maintenant"}
        </Button>
      </div>
    </div>
  );
};

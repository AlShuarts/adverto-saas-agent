
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type BannerGenerationButtonProps = {
  isGenerating: boolean;
  hasRequiredInfo: boolean;
  onClick: () => void;
};

export const BannerGenerationButton = ({ 
  isGenerating, 
  hasRequiredInfo, 
  onClick 
}: BannerGenerationButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isGenerating || !hasRequiredInfo}
      className="w-full bg-primary hover:bg-primary/90"
      variant={hasRequiredInfo ? "default" : "outline"}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération en cours...
        </>
      ) : (
        hasRequiredInfo ? "Générer la bannière" : "Veuillez remplir tous les champs requis"
      )}
    </Button>
  );
};


import { Button } from "@/components/ui/button";
import { Loader2, Tag } from "lucide-react";

type BannerStepProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  onGenerateBanner: () => Promise<void>;
  onRegenerateBanner: () => void;
};

export const BannerStep = ({
  isGeneratingBanner,
  bannerUrl,
  bannerError,
  onGenerateBanner,
  onRegenerateBanner,
}: BannerStepProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium">Génération de la bannière</h4>
      
      {!bannerUrl ? (
        <div className="flex flex-col items-center justify-center py-4">
          {isGeneratingBanner ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Création de la bannière en cours...
              </p>
            </div>
          ) : (
            <>
              <Button 
                onClick={onGenerateBanner} 
                disabled={isGeneratingBanner}
                className="w-full"
              >
                {isGeneratingBanner ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : "Générer la bannière"}
              </Button>
              
              {bannerError && (
                <div className="text-sm text-red-500 mt-2">
                  {bannerError}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-green-500 flex items-center gap-1">
              <Tag className="w-4 h-4" /> Bannière générée avec succès
            </span>
            <Button 
              variant="outline" 
              onClick={onRegenerateBanner}
            >
              Régénérer
            </Button>
          </div>
          
          <div className="border rounded-md p-2 bg-muted/20">
            <img src={bannerUrl} alt="Bannière générée" className="max-h-[200px] mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};

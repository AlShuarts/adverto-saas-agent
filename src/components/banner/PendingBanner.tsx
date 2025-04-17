
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PendingBannerProps = {
  bannerType: string;
  isRefreshing: boolean;
  hasError: boolean;
  errorMessage: string;
  onCheckStatus: () => void;
};

export const PendingBanner = ({ 
  bannerType, 
  isRefreshing, 
  hasError, 
  errorMessage, 
  onCheckStatus 
}: PendingBannerProps) => {
  return (
    <div className="flex flex-col items-center">
      <Loader2 className="h-6 w-6 animate-spin mb-2" />
      <h3 className="text-lg font-medium">Bannière "{bannerType}" en cours de création</h3>
      <p className="text-sm text-muted-foreground">
        Cela peut prendre quelques instants...
      </p>
      {hasError && (
        <Alert variant="destructive" className="mt-4 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage || "Une erreur s'est produite."}</AlertDescription>
        </Alert>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-3" 
        onClick={onCheckStatus} 
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Vérifier le statut
      </Button>
    </div>
  );
};

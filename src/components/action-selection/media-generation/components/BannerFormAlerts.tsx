
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type BannerFormAlertsProps = {
  hasRequiredInfo: boolean;
  missingFields: string[];
  formErrors: {[key: string]: string};
  bannerError: string | null;
};

export const BannerFormAlerts = ({ 
  hasRequiredInfo, 
  missingFields, 
  formErrors, 
  bannerError 
}: BannerFormAlertsProps) => {
  return (
    <>
      {!hasRequiredInfo && (
        <Alert variant="default" className="mb-4 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Des informations obligatoires sont manquantes: {missingFields.join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      {Object.entries(formErrors).length > 0 && (
        <div className="text-sm text-red-500 mt-2 p-2 bg-red-500/10 rounded-md w-full text-center">
          Veuillez remplir correctement tous les champs requis.
        </div>
      )}
      
      {bannerError && (
        <div className="text-sm text-red-500 mt-2 p-2 bg-red-500/10 rounded-md w-full text-center">
          {bannerError}
        </div>
      )}
    </>
  );
};

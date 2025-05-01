
import { Loader2 } from "lucide-react";

export const GeneratingSlideshow = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Création du diaporama en cours...
      </p>
      <div className="w-full max-w-xs bg-gray-700 h-1.5 rounded-full overflow-hidden">
        <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "100%" }}></div>
      </div>
    </div>
  );
};


import { Button } from "@/components/ui/button";
import { Loader2, Video, Play, RefreshCw } from "lucide-react";

type SlideshowStepProps = {
  isGeneratingSlideshow: boolean;
  slideshowUrl: string | null;
  slideshowError: string | null;
  slideshowRenderId: string | null;
  selectedImages: string[];
  onGenerateSlideshow: () => Promise<string | null>;
  onRegenerateSlideshow: () => void;
  onCheckStatus: () => void;
  isManualChecking?: boolean;
};

export const SlideshowStep = ({
  isGeneratingSlideshow,
  slideshowUrl,
  slideshowError,
  slideshowRenderId,
  selectedImages,
  onGenerateSlideshow,
  onRegenerateSlideshow,
  onCheckStatus,
  isManualChecking = false
}: SlideshowStepProps) => {
  if (selectedImages.length === 0) {
    return (
      <div className="mt-4">
        <Button
          disabled={true}
          className="w-full"
          variant="secondary"
        >
          <Video className="mr-2 h-4 w-4" />
          Sélectionnez au moins une image pour générer un diaporama
        </Button>
      </div>
    );
  }

  if (isGeneratingSlideshow) {
    return (
      <div className="mt-4 space-y-2">
        <Button
          disabled={true}
          className="w-full"
          variant="secondary"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération du diaporama en cours...
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Cette opération peut prendre quelques minutes.
        </div>
        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "100%" }}></div>
        </div>
      </div>
    );
  }

  if (slideshowUrl) {
    return (
      <div className="mt-4">
        <Button
          variant="secondary"
          className="w-full"
          onClick={onRegenerateSlideshow}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Régénérer le diaporama
        </Button>
      </div>
    );
  }

  if (slideshowRenderId && !slideshowUrl) {
    return (
      <div className="mt-4 space-y-2">
        <div className="text-center text-sm text-muted-foreground">
          Le traitement du diaporama est en cours...
        </div>
        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "80%" }}></div>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={onCheckStatus}
          disabled={isManualChecking}
        >
          {isManualChecking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Vérifier l'état du diaporama
        </Button>
      </div>
    );
  }

  if (slideshowError) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-red-500">{slideshowError}</p>
        <Button
          variant="destructive"
          className="w-full"
          onClick={onGenerateSlideshow}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer la génération
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Button
        onClick={onGenerateSlideshow}
        className="w-full"
        variant="default"
        disabled={selectedImages.length === 0}
      >
        <Play className="mr-2 h-4 w-4" />
        {selectedImages.length > 0
          ? "Générer le diaporama"
          : "Sélectionnez au moins une image"}
      </Button>
    </div>
  );
};

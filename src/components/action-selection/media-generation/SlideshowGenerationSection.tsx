import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SlideshowStep } from "../steps/SlideshowStep";
import { SlideshowPlayer } from "@/components/slideshow/SlideshowPlayer";

type SlideshowGenerationSectionProps = {
  isGeneratingSlideshow: boolean;
  slideshowUrl: string | null;
  slideshowError: string | null;
  slideshowRenderId: string | null;
  generateSlideshow: () => Promise<string | null>;
  refetchSlideshowStatus: () => void;
  onRegenerateSlideshow: () => void;
  selectedImages: string[];
  selectedMusic?: string;
  toggleImageSelection: (imageUrl: string) => void;
};

export const SlideshowGenerationSection = ({
  isGeneratingSlideshow,
  slideshowUrl,
  slideshowError,
  slideshowRenderId,
  generateSlideshow,
  refetchSlideshowStatus,
  onRegenerateSlideshow,
  selectedImages,
  selectedMusic,
  toggleImageSelection
}: SlideshowGenerationSectionProps) => {
  const [isManualChecking, setIsManualChecking] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const isMobile = useIsMobile();
  
  const handleCheckStatus = () => {
    setIsManualChecking(true);
    refetchSlideshowStatus();
    setTimeout(() => setIsManualChecking(false), 2000);
  };
  
  const musicName = selectedMusic ? selectedMusic.replace(/\.[^/.]+$/, "") : "";
  
  return (
    <div className="space-y-4">
      {/* Show slideshow preview if available and requested */}
      {slideshowUrl && showPreview && (
        <div className="mb-4 bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">Aperçu du diaporama</h3>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <SlideshowPlayer 
              images={selectedImages}
              musicUrl={selectedMusic ? `https://msmuyhmxlrkcjthugcxd.supabase.co/storage/v1/object/public/background-music/${selectedMusic}` : null}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(false)}
            className="mt-2"
          >
            Masquer l'aperçu
          </Button>
        </div>
      )}
      
      {/* Generation status message */}
      {(isGeneratingSlideshow || slideshowRenderId) && !slideshowUrl && (
        <div className="text-center p-4 bg-card rounded-lg border">
          <Loader2 className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} animate-spin mx-auto mb-2 text-primary`} />
          <p className={`mb-2 text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
            {slideshowRenderId ? 
              "Traitement en cours..." : 
              "Génération en cours..."}
          </p>
          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: slideshowRenderId ? "80%" : "40%" }}></div>
          </div>
        </div>
      )}
      
      {/* Always show the SlideshowStep component (which has the generate button) */}
      <SlideshowStep
        isGeneratingSlideshow={isGeneratingSlideshow}
        slideshowUrl={slideshowUrl}
        slideshowError={slideshowError}
        slideshowRenderId={slideshowRenderId}
        selectedImages={selectedImages}
        onGenerateSlideshow={generateSlideshow}
        onRegenerateSlideshow={onRegenerateSlideshow}
        onCheckStatus={handleCheckStatus}
        isManualChecking={isManualChecking}
      />
      
      {/* Show preview button if slideshow is ready but preview is not showing */}
      {slideshowUrl && !showPreview && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowPreview(true)}
        >
          Afficher l'aperçu du diaporama
        </Button>
      )}
      
      {slideshowRenderId && !slideshowUrl && !isGeneratingSlideshow && (
        <div className="text-xs text-center text-muted-foreground mt-2">
          ID de traitement: {slideshowRenderId}
        </div>
      )}
    </div>
  );
};

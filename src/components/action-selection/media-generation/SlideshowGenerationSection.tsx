
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageSelection } from "./components/ImageSelection";
import { SlideshowStep } from "../steps/SlideshowStep";

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
  toggleImageSelection?: (imageUrl: string) => void;
  availableImages?: string[]; // Allow for passing available images
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
  toggleImageSelection,
  availableImages
}: SlideshowGenerationSectionProps) => {
  const [isManualChecking, setIsManualChecking] = React.useState(false);
  const isMobile = useIsMobile();
  
  const handleCheckStatus = () => {
    setIsManualChecking(true);
    refetchSlideshowStatus();
    setTimeout(() => setIsManualChecking(false), 2000);
  };
  
  const musicName = selectedMusic ? selectedMusic.replace(/\.[^/.]+$/, "") : "";
  
  return (
    <div className="space-y-4">
      {/* Always show the ImageSelection component */}
      <ImageSelection 
        selectedImages={selectedImages} 
        toggleImageSelection={toggleImageSelection!} 
        availableImages={availableImages}
      />
      
      {/* Show the SlideshowStep component (which has the generate button) */}
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
    </div>
  );
};

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
  return;
};

import { Facebook, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SlideshowDialogFooterProps = {
  onClose: () => void;
  onPublish: (message: string) => void;
  handleInstagramPublish: () => void;
  isPublishing: boolean;
  isPublishingToInstagram: boolean;
  editedText: string;  // Add this prop
};

export const SlideshowDialogFooter = ({
  onClose,
  onPublish,
  handleInstagramPublish,
  isPublishing,
  isPublishingToInstagram,
  editedText  // Use this prop
}: SlideshowDialogFooterProps) => (
  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-2">
    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
      Annuler
    </Button>
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Button 
        onClick={() => onPublish(editedText)} 
        disabled={isPublishing || isPublishingToInstagram}
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
        {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
      </Button>
      <Button 
        onClick={handleInstagramPublish} 
        disabled={isPublishing || isPublishingToInstagram}
        variant="secondary"
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        {isPublishingToInstagram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}
        {isPublishingToInstagram ? "Publication en cours..." : "Publier sur Instagram"}
      </Button>
    </div>
  </div>
);

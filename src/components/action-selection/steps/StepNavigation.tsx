
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type StepNavigationProps = {
  currentStep: number;
  isPublishing: boolean;
  canGoToNextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPublish: () => void;
  onCancel: () => void;
  isLastStep: boolean;
};

export const StepNavigation = ({
  currentStep,
  isPublishing,
  canGoToNextStep,
  onPrevious,
  onNext,
  onPublish,
  onCancel,
  isLastStep
}: StepNavigationProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 w-full">
      <div className="flex-1 flex">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="flex items-center"
            size={isMobile ? "sm" : "default"}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Précédent</span>
          </Button>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          size={isMobile ? "sm" : "default"}
        >
          <span className="hidden sm:inline">Annuler</span>
          <X className="h-4 w-4 sm:hidden" />
        </Button>
        
        {isLastStep ? (
          <Button
            type="button"
            onClick={onPublish}
            disabled={isPublishing || !canGoToNextStep}
            size={isMobile ? "sm" : "default"}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Publication...</span>
              </>
            ) : "Publier"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoToNextStep}
            className="flex items-center"
            size={isMobile ? "sm" : "default"}
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="sm:hidden">OK</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

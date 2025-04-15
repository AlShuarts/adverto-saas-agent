
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 border-t pt-4 mt-2 w-full">
      <div className="flex-1 flex">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Précédent
          </Button>
        )}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
        
        {!isLastStep ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoToNextStep}
            className="flex items-center"
          >
            Suivant
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onPublish}
            disabled={isPublishing || !canGoToNextStep}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication...
              </>
            ) : "Publier"}
          </Button>
        )}
      </div>
    </div>
  );
};

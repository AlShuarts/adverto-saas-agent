
import { DialogFooter } from "@/components/ui/dialog";
import { StepNavigation } from "../../steps/StepNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

type ActionDialogFooterProps = {
  currentStep: number;
  isPublishing: boolean;
  canGoToNextStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPublish: () => Promise<void>;
  onCancel: () => void;
};

export const ActionDialogFooter = ({
  currentStep,
  isPublishing,
  canGoToNextStep,
  onPrevious,
  onNext,
  onPublish,
  onCancel
}: ActionDialogFooterProps) => {
  const isMobile = useIsMobile();
  
  return (
    <DialogFooter className={`border-t border-gray-800 ${isMobile ? "pt-1" : "pt-2"} mt-auto shrink-0`}>
      <StepNavigation 
        currentStep={currentStep}
        isPublishing={isPublishing}
        canGoToNextStep={canGoToNextStep}
        onPrevious={onPrevious}
        onNext={onNext}
        onPublish={onPublish}
        onCancel={onCancel}
        isLastStep={currentStep === 6}
      />
    </DialogFooter>
  );
};

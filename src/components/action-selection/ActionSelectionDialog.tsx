
import { Dialog } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { ActionSelectionProvider } from "./context/ActionSelectionContext";
import { ActionSelectionDialogContent } from "./ActionSelectionDialogContent";

type ActionSelectionDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const ActionSelectionDialog = ({ listing, isOpen, onClose }: ActionSelectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <ActionSelectionProvider listing={listing} onClose={onClose}>
        <ActionSelectionDialogContent />
      </ActionSelectionProvider>
    </Dialog>
  );
};

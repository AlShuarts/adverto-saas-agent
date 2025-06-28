
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const ActionDialogHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <DialogHeader className={`${isMobile ? "pb-1" : "pb-2"} border-b border-gray-800`}>
      <DialogTitle className={`${isMobile ? "text-base" : "text-lg"} text-white`}>
        Publication sur les réseaux sociaux
      </DialogTitle>
      <DialogDescription className={`${isMobile ? "text-xs" : "text-sm"} text-gray-400`}>
        Créez une publication pour diffuser votre bien immobilier sur les réseaux sociaux.
      </DialogDescription>
    </DialogHeader>
  );
};

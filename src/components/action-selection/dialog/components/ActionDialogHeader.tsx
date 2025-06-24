
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const ActionDialogHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <DialogHeader className={`${isMobile ? "pb-2" : "pb-4"} border-b border-gray-800`}>
      <DialogTitle className={`${isMobile ? "text-lg" : "text-xl"} text-white`}>
        Publication sur les réseaux sociaux
      </DialogTitle>
      <DialogDescription className={`${isMobile ? "text-sm" : "text-base"} text-gray-400`}>
        Créez une publication pour diffuser votre bien immobilier sur les réseaux sociaux.
      </DialogDescription>
    </DialogHeader>
  );
};

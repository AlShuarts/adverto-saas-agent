
import { ImageIcon } from "lucide-react";

export const BannerConfigurationHeader = () => {
  return (
    <h4 className="font-medium flex items-center space-x-2">
      <ImageIcon size={18} className="text-primary" />
      <span>Configuration de la bannière</span>
    </h4>
  );
};

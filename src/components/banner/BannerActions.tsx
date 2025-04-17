import { useState } from "react";
import { Facebook, Instagram, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
type BannerActionsProps = {
  imageUrl: string;
  bannerType: string;
  onFacebookShare: (imageUrl: string, bannerType: string) => Promise<void>;
  onInstagramShare: (imageUrl: string, bannerType: string) => Promise<void>;
  isPublishing: boolean;
};
export const BannerActions = ({
  imageUrl,
  bannerType,
  onFacebookShare,
  onInstagramShare,
  isPublishing
}: BannerActionsProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `banniere-${bannerType.toLowerCase()}.png`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Téléchargement réussi !");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };
  return;
};
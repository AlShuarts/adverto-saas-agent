
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

  return (
    <div className="flex flex-col space-y-3">
      <div className="relative rounded-md overflow-hidden bg-gray-100">
        {!isImageLoaded && (
          <Skeleton className="w-full aspect-[4/3]" />
        )}
        <img 
          src={imageUrl} 
          alt={`Bannière ${bannerType}`}
          className="w-full h-auto rounded-md" 
          onLoad={() => setIsImageLoaded(true)}
          style={{ display: isImageLoaded ? 'block' : 'none' }}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button 
          size="sm"
          variant="outline" 
          onClick={handleDownload}
          className="flex items-center justify-center"
        >
          <Download className="h-4 w-4 mr-1" />
          <span className="text-xs">Télécharger</span>
        </Button>
        <Button 
          size="sm"
          variant="outline" 
          onClick={() => onFacebookShare(imageUrl, bannerType)}
          disabled={isPublishing}
          className="flex items-center justify-center"
        >
          <Facebook className="h-4 w-4 mr-1" />
          <span className="text-xs">Facebook</span>
        </Button>
        <Button 
          size="sm"
          variant="outline" 
          onClick={() => onInstagramShare(imageUrl, bannerType)}
          disabled={isPublishing}
          className="flex items-center justify-center"
        >
          <Instagram className="h-4 w-4 mr-1" />
          <span className="text-xs">Instagram</span>
        </Button>
      </div>
    </div>
  );
};

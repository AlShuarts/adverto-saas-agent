
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
    <div className="flex flex-col space-y-4">
      <div className="relative border rounded-md overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`Bannière ${bannerType}`} 
          className="w-full h-auto"
          onLoad={() => setIsImageLoaded(true)}
          style={{ display: isImageLoaded ? 'block' : 'none' }}
        />
        {!isImageLoaded && (
          <Skeleton className="w-full h-32" />
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Télécharger
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
          onClick={() => onFacebookShare(imageUrl, bannerType)}
          disabled={isPublishing}
        >
          <Facebook className="h-4 w-4" />
          Facebook
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
          onClick={() => onInstagramShare(imageUrl, bannerType)}
          disabled={isPublishing}
        >
          <Instagram className="h-4 w-4" />
          Instagram
        </Button>
      </div>
    </div>
  );
};

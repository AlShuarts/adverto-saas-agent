
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

type BannerPreviewProps = {
  bannerUrl: string;
  onRegenerate: () => void;
};

export const BannerPreview = ({ bannerUrl, onRegenerate }: BannerPreviewProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-green-500 flex items-center gap-1">
          <Tag className="w-4 h-4" /> Bannière générée avec succès
        </span>
        <Button 
          variant="outline"
          onClick={onRegenerate}
        >
          Régénérer
        </Button>
      </div>
      
      <div className="border rounded-md p-3 bg-muted/20 flex justify-center">
        <img 
          src={bannerUrl} 
          alt="Bannière générée" 
          className="max-h-[200px] shadow-md rounded-sm" 
        />
      </div>
    </div>
  );
};


import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type BannerImageSelectorProps = {
  images: string[];
  bannerImage: string | null;
  selectBannerImage: (imageUrl: string) => void;
  bannerType: "VENDU" | "À VENDRE";
  setBannerType: (type: "VENDU" | "À VENDRE") => void;
};

export const BannerImageSelector = ({
  images,
  bannerImage,
  selectBannerImage,
  bannerType,
  setBannerType
}: BannerImageSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="banner-type">Type de bannière</Label>
        <Select 
          value={bannerType} 
          onValueChange={(value) => setBannerType(value as "VENDU" | "À VENDRE")}
        >
          <SelectTrigger id="banner-type" className="mt-1">
            <SelectValue placeholder="Type de bannière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VENDU">VENDU</SelectItem>
            <SelectItem value="À VENDRE">À VENDRE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Sélection de l'image principale</Label>
        <ScrollArea className="h-[220px] border rounded-lg p-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
            {images?.map(imageUrl => (
              <div
                key={imageUrl}
                className={`relative cursor-pointer border-2 ${
                  bannerImage === imageUrl ? "border-primary" : "border-transparent"
                } rounded overflow-hidden`}
                onClick={() => selectBannerImage(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt="Property"
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

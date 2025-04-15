
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BannerTypeSelectorProps = {
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
};

export const BannerTypeSelector = ({ bannerType, setBannerType }: BannerTypeSelectorProps) => {
  return (
    <div>
      <Label htmlFor="bannerType">Type de bannière</Label>
      <Select 
        value={bannerType} 
        onValueChange={(value) => setBannerType(value as "VENDU" | "A_VENDRE")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez le type de bannière" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="VENDU">VENDU</SelectItem>
          <SelectItem value="A_VENDRE">À VENDRE</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

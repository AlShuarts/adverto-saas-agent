
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type BannerTypeSelectorProps = {
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
};

export const BannerTypeSelector = ({ bannerType, setBannerType }: BannerTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bannerType">Type de bannière</Label>
      <RadioGroup 
        value={bannerType} 
        onValueChange={(value) => setBannerType(value as "VENDU" | "A_VENDRE")}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="VENDU" id="option-vendu" />
          <Label htmlFor="option-vendu" className="cursor-pointer">VENDU</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="A_VENDRE" id="option-a-vendre" />
          <Label htmlFor="option-a-vendre" className="cursor-pointer">À VENDRE</Label>
        </div>
      </RadioGroup>
    </div>
  );
};


import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormError } from "./FormError";
import { Tag } from "lucide-react";

type BannerTypeSelectorProps = {
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  error?: string;
};

export const BannerTypeSelector = ({ bannerType, setBannerType, error }: BannerTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bannerType" className={error ? "text-destructive flex items-center" : "flex items-center"}>
        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
        Type de bannière
      </Label>
      <RadioGroup 
        value={bannerType} 
        onValueChange={(value) => setBannerType(value as "VENDU" | "A_VENDRE")}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2 bg-muted/30 px-4 py-2 rounded-md">
          <RadioGroupItem value="VENDU" id="option-vendu" />
          <Label htmlFor="option-vendu" className="cursor-pointer font-medium">VENDU</Label>
        </div>
        <div className="flex items-center space-x-2 bg-muted/30 px-4 py-2 rounded-md">
          <RadioGroupItem value="A_VENDRE" id="option-a-vendre" />
          <Label htmlFor="option-a-vendre" className="cursor-pointer font-medium">À VENDRE</Label>
        </div>
      </RadioGroup>
      <FormError error={error} />
    </div>
  );
};

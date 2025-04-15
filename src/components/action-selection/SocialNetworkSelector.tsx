
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialNetworks } from "./types";

type SocialNetworkSelectorProps = {
  selectedNetworks: SocialNetworks;
  onNetworkChange: (network: keyof SocialNetworks, checked: boolean) => void;
};

export const SocialNetworkSelector = ({ 
  selectedNetworks, 
  onNetworkChange 
}: SocialNetworkSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="facebook" 
          checked={selectedNetworks.facebook}
          onCheckedChange={(checked) => onNetworkChange("facebook", !!checked)}
        />
        <Label htmlFor="facebook" className="cursor-pointer">Facebook</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="instagram" 
          checked={selectedNetworks.instagram}
          onCheckedChange={(checked) => onNetworkChange("instagram", !!checked)}
        />
        <Label htmlFor="instagram" className="cursor-pointer">Instagram</Label>
      </div>
    </div>
  );
};

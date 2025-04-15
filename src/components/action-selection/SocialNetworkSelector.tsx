
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Facebook, Instagram } from "lucide-react";

type SocialNetworkSelectorProps = {
  selectedNetworks: {
    facebook: boolean;
    instagram: boolean;
  };
  onNetworkChange: (networks: { facebook: boolean; instagram: boolean }) => void;
};

export const SocialNetworkSelector = ({
  selectedNetworks,
  onNetworkChange,
}: SocialNetworkSelectorProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium">Sélection des réseaux sociaux</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="network-facebook" 
              checked={selectedNetworks.facebook}
              onCheckedChange={(checked) => onNetworkChange({
                ...selectedNetworks,
                facebook: !!checked
              })}
            />
            <div className="space-y-2">
              <Label 
                htmlFor="network-facebook" 
                className="flex items-center cursor-pointer"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Label>
              <p className="text-sm text-muted-foreground">
                Publier sur votre page Facebook.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="network-instagram" 
              checked={selectedNetworks.instagram}
              onCheckedChange={(checked) => onNetworkChange({
                ...selectedNetworks,
                instagram: !!checked
              })}
            />
            <div className="space-y-2">
              <Label 
                htmlFor="network-instagram" 
                className="flex items-center cursor-pointer"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Label>
              <p className="text-sm text-muted-foreground">
                Publier sur votre compte Instagram.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

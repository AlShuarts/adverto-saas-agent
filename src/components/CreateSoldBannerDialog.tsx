
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

type CreateSoldBannerDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const CreateSoldBannerDialog = ({ listing, isOpen, onClose }: CreateSoldBannerDialogProps) => {
  const { profile } = useProfile();
  const [selectedImage, setSelectedImage] = useState<string>(listing.images?.[0] || "");
  const [isCreating, setIsCreating] = useState(false);
  const [brokerName, setBrokerName] = useState(
    profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ""
  );
  const [brokerEmail, setBrokerEmail] = useState("");
  const [brokerPhone, setBrokerPhone] = useState(profile?.phone || "");
  const [brokerImage, setBrokerImage] = useState<string | null>(null);
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [uploadingBrokerImage, setUploadingBrokerImage] = useState(false);
  const [uploadingAgencyLogo, setUploadingAgencyLogo] = useState(false);
  const [bannerType, setBannerType] = useState<"VENDU" | "A_VENDRE">("VENDU");

  const handleFileUpload = async (file: File, type: "broker" | "agency") => {
    try {
      if (type === "broker") {
        setUploadingBrokerImage(true);
      } else {
        setUploadingAgencyLogo(true);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('listings-images')
        .upload(fileName, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);
        
      if (type === "broker") {
        setBrokerImage(publicUrl);
      } else {
        setAgencyLogo(publicUrl);
      }
      
      toast.success(`Image ${type === "broker" ? "du courtier" : "du logo"} téléchargée avec succès`);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error(`Erreur lors du téléchargement de l'image: ${error.message}`);
    } finally {
      if (type === "broker") {
        setUploadingBrokerImage(false);
      } else {
        setUploadingAgencyLogo(false);
      }
    }
  };

  const handleBrokerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], "broker");
    }
  };

  const handleAgencyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], "agency");
    }
  };

  const handleCreateBanner = async () => {
    try {
      setIsCreating(true);
      
      // Configuration pour la bannière
      const config = {
        mainImage: selectedImage,
        brokerImage,
        agencyLogo,
        brokerName,
        brokerEmail,
        brokerPhone,
        bannerType
      };
      
      const { data, error } = await supabase.functions.invoke('create-sold-banner', {
        body: {
          listingId: listing.id,
          config
        },
      });
      
      if (error) throw error;
      
      toast.success(
        bannerType === "VENDU" 
          ? "La bannière VENDU est en cours de création" 
          : "La bannière À VENDRE est en cours de création", 
        {
          description: "Vous recevrez une notification lorsqu'elle sera prête",
          duration: 5000
        }
      );
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la bannière:", error);
      toast.error(`Erreur: ${error.message || "Impossible de créer la bannière"}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  const bannerTitle = bannerType === "VENDU" ? "VENDU" : "À VENDRE";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer une bannière &quot;{bannerTitle}&quot;</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
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
          
          <div className="grid gap-2">
            <Label htmlFor="propertyImage">Image de la propriété</Label>
            <Select value={selectedImage} onValueChange={setSelectedImage}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une image" />
              </SelectTrigger>
              <SelectContent>
                {listing.images?.map((image, index) => (
                  <SelectItem key={index} value={image}>
                    Image {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedImage && (
              <div className="aspect-video overflow-hidden rounded-md mt-2">
                <img
                  src={selectedImage}
                  alt="Image sélectionnée"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="brokerName">Nom du courtier</Label>
            <Input
              id="brokerName"
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              placeholder="Nom du courtier"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="brokerEmail">Email du courtier</Label>
            <Input
              id="brokerEmail"
              value={brokerEmail}
              onChange={(e) => setBrokerEmail(e.target.value)}
              placeholder="Email du courtier"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="brokerPhone">Téléphone du courtier</Label>
            <Input
              id="brokerPhone"
              value={brokerPhone}
              onChange={(e) => setBrokerPhone(e.target.value)}
              placeholder="Téléphone du courtier"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="brokerImage">Photo du courtier</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("brokerImageInput")?.click()}
                  disabled={uploadingBrokerImage}
                >
                  {uploadingBrokerImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Télécharger
                </Button>
                <Input
                  id="brokerImageInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBrokerImageChange}
                />
              </div>
              {brokerImage && (
                <div className="w-20 h-20 rounded-full overflow-hidden mt-2">
                  <img
                    src={brokerImage}
                    alt="Photo du courtier"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="agencyLogo">Logo de l'agence</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("agencyLogoInput")?.click()}
                  disabled={uploadingAgencyLogo}
                >
                  {uploadingAgencyLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Télécharger
                </Button>
                <Input
                  id="agencyLogoInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAgencyLogoChange}
                />
              </div>
              {agencyLogo && (
                <div className="w-24 h-12 overflow-hidden mt-2">
                  <img
                    src={agencyLogo}
                    alt="Logo de l'agence"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateBanner} 
            disabled={isCreating || !selectedImage}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              `Créer la bannière "${bannerTitle}"`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

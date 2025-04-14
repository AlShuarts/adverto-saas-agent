
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, AlertTriangle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { Alert, AlertDescription } from "@/components/ui/alert";

type CreateSoldBannerDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const CreateSoldBannerDialog = ({ listing, isOpen, onClose }: CreateSoldBannerDialogProps) => {
  const { profile } = useProfile();
  const [selectedImage, setSelectedImage] = useState<string>(listing.images?.[0] || "");
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Initialize form values with profile data when available
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

  // Set broker email from auth when component mounts
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setBrokerEmail(data.user.email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };
    
    fetchEmail();
  }, []);

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

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedImage) {
      errors.selectedImage = "Veuillez sélectionner une image";
    }
    
    if (!brokerName || brokerName.trim() === '') {
      errors.brokerName = "Le nom du courtier est requis";
    }
    
    if (!brokerPhone || brokerPhone.trim() === '') {
      errors.brokerPhone = "Le téléphone du courtier est requis";
    }
    
    if (!brokerEmail || brokerEmail.trim() === '') {
      errors.brokerEmail = "L'email du courtier est requis";
    } else if (!/\S+@\S+\.\S+/.test(brokerEmail)) {
      errors.brokerEmail = "L'email semble invalide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBanner = async () => {
    try {
      if (!validateForm()) {
        toast.error("Veuillez remplir tous les champs obligatoires", {
          description: "Tous les champs marqués sont requis pour créer la bannière"
        });
        return;
      }
      
      setIsCreating(true);
      
      // Incrémenter les statistiques de génération de bannière
      await ensureAndIncrementStatistic('banner');
      
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
      
      console.log("Sending banner creation request with config:", config);
      
      const { data, error } = await supabase.functions.invoke('create-sold-banner', {
        body: {
          listingId: listing.id,
          config
        },
      });
      
      if (error) throw error;
      
      console.log("Banner creation response:", data);
      
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
        
        {(!listing.images || listing.images.length === 0) && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Cette propriété n'a pas d'images. Veuillez d'abord ajouter des images à la propriété.
            </AlertDescription>
          </Alert>
        )}
        
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
            <Label htmlFor="propertyImage" className={formErrors.selectedImage ? "text-destructive" : ""}>
              Image de la propriété *
            </Label>
            <Select 
              value={selectedImage} 
              onValueChange={(value) => {
                setSelectedImage(value);
                if (formErrors.selectedImage) {
                  const { selectedImage, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
            >
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
            {formErrors.selectedImage && (
              <p className="text-xs text-destructive">{formErrors.selectedImage}</p>
            )}
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
            <Label htmlFor="brokerName" className={formErrors.brokerName ? "text-destructive" : ""}>
              Nom du courtier *
            </Label>
            <Input
              id="brokerName"
              value={brokerName}
              onChange={(e) => {
                setBrokerName(e.target.value);
                if (formErrors.brokerName) {
                  const { brokerName, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              placeholder="Nom du courtier"
              className={formErrors.brokerName ? "border-destructive" : ""}
            />
            {formErrors.brokerName && (
              <p className="text-xs text-destructive">{formErrors.brokerName}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="brokerEmail" className={formErrors.brokerEmail ? "text-destructive" : ""}>
              Email du courtier *
            </Label>
            <Input
              id="brokerEmail"
              value={brokerEmail}
              onChange={(e) => {
                setBrokerEmail(e.target.value);
                if (formErrors.brokerEmail) {
                  const { brokerEmail, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              placeholder="Email du courtier"
              className={formErrors.brokerEmail ? "border-destructive" : ""}
            />
            {formErrors.brokerEmail && (
              <p className="text-xs text-destructive">{formErrors.brokerEmail}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="brokerPhone" className={formErrors.brokerPhone ? "text-destructive" : ""}>
              Téléphone du courtier *
            </Label>
            <Input
              id="brokerPhone"
              value={brokerPhone}
              onChange={(e) => {
                setBrokerPhone(e.target.value);
                if (formErrors.brokerPhone) {
                  const { brokerPhone, ...rest } = formErrors;
                  setFormErrors(rest);
                }
              }}
              placeholder="Téléphone du courtier"
              className={formErrors.brokerPhone ? "border-destructive" : ""}
            />
            {formErrors.brokerPhone && (
              <p className="text-xs text-destructive">{formErrors.brokerPhone}</p>
            )}
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
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], "broker");
                    }
                  }}
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
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], "agency");
                    }
                  }}
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
          
          <div className="text-sm text-muted-foreground mt-2">
            * Champs obligatoires
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateBanner} 
            disabled={isCreating || !listing.images || listing.images.length === 0}
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

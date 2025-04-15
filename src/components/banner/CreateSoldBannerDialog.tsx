
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PropertyImageSelector } from "./PropertyImageSelector";
import { BannerTypeSelector } from "./BannerTypeSelector";
import { BrokerInfoForm } from "./BrokerInfoForm";
import { ImageUploader } from "./ImageUploader";

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
  const [brokerEmail, setBrokerEmail] = useState<string>("");
  const [brokerPhone, setBrokerPhone] = useState(profile?.phone || "");
  const [brokerImage, setBrokerImage] = useState<string | null>(null);
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<"VENDU" | "A_VENDRE">("VENDU");

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(listing.images?.[0] || "");
      setFormErrors({});
      setBrokerName(profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : "");
      setBrokerPhone(profile?.phone || "");
      setBrokerEmail("");
      setBrokerImage(null);
      setAgencyLogo(null);
      setBannerType("VENDU");
    }
  }, [isOpen, listing.images, profile]);

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
    } catch (error: any) {
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
          <BannerTypeSelector bannerType={bannerType} setBannerType={setBannerType} />
          
          <PropertyImageSelector 
            images={listing.images || []} 
            selectedImage={selectedImage} 
            setSelectedImage={setSelectedImage}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
          />
          
          <BrokerInfoForm 
            brokerName={brokerName}
            setBrokerName={setBrokerName}
            brokerEmail={brokerEmail}
            setBrokerEmail={setBrokerEmail}
            brokerPhone={brokerPhone}
            setBrokerPhone={setBrokerPhone}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <ImageUploader 
              type="broker" 
              imageUrl={brokerImage} 
              setImageUrl={setBrokerImage} 
            />
            
            <ImageUploader 
              type="agency" 
              imageUrl={agencyLogo} 
              setImageUrl={setAgencyLogo} 
            />
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
            type="button"
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

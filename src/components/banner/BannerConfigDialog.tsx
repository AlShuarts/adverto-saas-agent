
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { BrokerInfoForm } from "./BrokerInfoForm";
import { ImageUploader } from "./ImageUploader";
import { useProfile } from "@/hooks/useProfile";

type BannerConfig = {
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
};

export const BannerConfigDialog = () => {
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<BannerConfig>({
    brokerName: "",
    brokerEmail: "",
    brokerPhone: "",
    brokerImageUrl: null,
    agencyLogoUrl: null
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Initialize with profile data when dialog opens
  useEffect(() => {
    if (isOpen && profile) {
      setConfig(prev => ({
        ...prev,
        brokerName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        brokerPhone: profile.phone || "",
      }));
    }
  }, [isOpen, profile]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!config.brokerName || config.brokerName.trim() === '') {
      errors.brokerName = "Le nom du courtier est requis";
    }
    
    if (!config.brokerEmail || config.brokerEmail.trim() === '') {
      errors.brokerEmail = "L'email du courtier est requis";
    } else if (!/\S+@\S+\.\S+/.test(config.brokerEmail)) {
      errors.brokerEmail = "L'email semble invalide";
    }
    
    if (!config.brokerPhone || config.brokerPhone.trim() === '') {
      errors.brokerPhone = "Le téléphone du courtier est requis";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Save to localStorage for later use
    localStorage.setItem('bannerConfig', JSON.stringify(config));
    
    toast.success("Configuration de bannière sauvegardée", {
      description: "Ces informations seront utilisées automatiquement lors de la création de bannières"
    });
    
    setIsOpen(false);
  };

  // Load saved config on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('bannerConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error);
      }
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full sm:w-auto">
          <Tag className="w-5 h-5 mr-2" />
          Configuration Bannière
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configuration des informations de bannière</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-6">
            {/* Informations du courtier */}
            <div className="space-y-2 border rounded-md p-4 bg-white">
              <h3 className="text-base font-medium text-primary font-bold border-b pb-2 mb-3">
                Informations du courtier
              </h3>
              <BrokerInfoForm 
                brokerName={config.brokerName}
                setBrokerName={(name) => setConfig(prev => ({ ...prev, brokerName: name }))}
                brokerEmail={config.brokerEmail}
                setBrokerEmail={(email) => setConfig(prev => ({ ...prev, brokerEmail: email }))}
                brokerPhone={config.brokerPhone}
                setBrokerPhone={(phone) => setConfig(prev => ({ ...prev, brokerPhone: phone }))}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
              />
            </div>
            
            {/* Images du courtier et de l'agence */}
            <div className="space-y-2 border rounded-md p-4 bg-white">
              <h3 className="text-base font-medium">Images du courtier et de l'agence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader 
                  type="broker" 
                  imageUrl={config.brokerImageUrl} 
                  setImageUrl={(url) => setConfig(prev => ({ ...prev, brokerImageUrl: url }))} 
                />
                
                <ImageUploader 
                  type="agency" 
                  imageUrl={config.agencyLogoUrl} 
                  setImageUrl={(url) => setConfig(prev => ({ ...prev, agencyLogoUrl: url }))} 
                />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mt-2">
            * Ces informations seront utilisées automatiquement lors de la création de bannières
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Sauvegarder la configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

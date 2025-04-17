import { Button } from "@/components/ui/button";
import { Loader2, Tag, Video, Play, User, Building, Mail, Phone } from "lucide-react";
import { FormError } from "@/components/banner/FormError";
import { PropertyImageSelector } from "@/components/banner/PropertyImageSelector";
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";
import { BrokerInfoSection } from "@/components/action-selection/media-selector/BrokerInfoSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MediaGenerationStepProps = {
  selectedPublicationTypes: Array<"photo" | "slideshow" | "banner">;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  formErrors: {[key: string]: string};
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  selectedImages: string[];
  refetchSlideshowStatus: () => void;
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  setFormErrors: (errors: {[key: string]: string}) => void;
};

export const MediaGenerationStep = ({
  selectedPublicationTypes,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowUrl,
  bannerUrl,
  slideshowError,
  bannerError,
  slideshowRenderId,
  formErrors,
  generateSlideshow,
  generateBanner,
  selectedImages,
  refetchSlideshowStatus,
  bannerImage,
  bannerType,
  setBannerType,
  selectBannerImage,
  brokerName,
  setBrokerName,
  brokerEmail,
  setBrokerEmail,
  brokerPhone,
  setBrokerPhone,
  brokerImageUrl,
  setBrokerImageUrl,
  agencyLogoUrl,
  setAgencyLogoUrl,
  setFormErrors
}: MediaGenerationStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 3.5: Génération des médias</h3>
      
      {selectedPublicationTypes.includes("slideshow") && (
        <div className="space-y-4 border rounded-md p-4">
          <h4 className="font-medium">Génération du diaporama</h4>
          
          {!slideshowUrl ? (
            <div className="flex flex-col items-center justify-center py-4">
              {isGeneratingSlideshow ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Génération du diaporama en cours...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ce processus peut prendre plusieurs minutes.
                  </p>
                </div>
              ) : slideshowRenderId && !slideshowError ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Traitement en cours...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Votre diaporama est en train d'être généré. Veuillez patienter.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refetchSlideshowStatus()}
                  >
                    Vérifier le statut
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={generateSlideshow} 
                    disabled={isGeneratingSlideshow || selectedImages.length === 0}
                    className="w-full"
                  >
                    {isGeneratingSlideshow ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : "Générer le diaporama"}
                  </Button>
                  
                  {slideshowError && (
                    <div className="text-sm text-red-500 mt-2">
                      {slideshowError}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-green-500 flex items-center gap-1">
                  <Video className="w-4 h-4" /> Diaporama généré avec succès
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // This would reset the slideshow state in the parent
                  }}
                >
                  Régénérer
                </Button>
              </div>
              
              <div className="border rounded-md p-2 bg-muted/20">
                <div className="flex justify-center">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(slideshowUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Prévisualiser le diaporama
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {selectedPublicationTypes.includes("banner") && (
        <div className="space-y-4 border rounded-md p-4">
          <h4 className="font-medium">Configuration de la bannière</h4>
          
          <div className="space-y-6">
            {/* Sélecteur d'image */}
            <PropertyImageSelector
              images={selectedImages.length > 0 ? selectedImages : []}
              selectedImage={bannerImage || ""}
              setSelectedImage={selectBannerImage}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
            />
            
            {/* Type de bannière */}
            <BannerTypeSelector
              bannerType={bannerType}
              setBannerType={setBannerType}
              error={formErrors.bannerType}
            />
            
            {/* Informations du courtier */}
            <div className="border-t pt-4 mt-6">
              <h5 className="text-sm font-medium mb-4">Informations du courtier</h5>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo du courtier */}
                  <div className="space-y-2">
                    <Label htmlFor="brokerImage" className={formErrors.brokerImage ? "text-destructive" : ""}>
                      Photo du courtier
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("brokerImage")?.click()}
                        type="button"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Télécharger la photo
                      </Button>
                      <Input
                        id="brokerImage"
                        type="file"
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    {brokerImageUrl && (
                      <div className="w-20 h-20 rounded-full overflow-hidden mt-2">
                        <img
                          src={brokerImageUrl}
                          alt="Photo du courtier"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <FormError error={formErrors.brokerImage} />
                  </div>
                  
                  {/* Logo de l'agence */}
                  <div className="space-y-2">
                    <Label htmlFor="agencyLogo" className={formErrors.agencyLogo ? "text-destructive" : ""}>
                      Logo de l'agence
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("agencyLogo")?.click()}
                        type="button"
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Télécharger le logo
                      </Button>
                      <Input
                        id="agencyLogo"
                        type="file"
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    {agencyLogoUrl && (
                      <div className="w-24 h-12 overflow-hidden mt-2">
                        <img
                          src={agencyLogoUrl}
                          alt="Logo de l'agence"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <FormError error={formErrors.agencyLogo} />
                  </div>
                </div>
                
                {/* Informations de contact */}
                <div className="space-y-4">
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
                      placeholder="Entrez le nom du courtier"
                      className={formErrors.brokerName ? "border-destructive" : ""}
                    />
                    <FormError error={formErrors.brokerName} />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="brokerEmail" className={formErrors.brokerEmail ? "text-destructive" : ""}>
                      Email du courtier *
                    </Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
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
                        placeholder="Entrez l'email du courtier"
                        className={formErrors.brokerEmail ? "border-destructive" : ""}
                      />
                    </div>
                    <FormError error={formErrors.brokerEmail} />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="brokerPhone" className={formErrors.brokerPhone ? "text-destructive" : ""}>
                      Téléphone du courtier *
                    </Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
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
                        placeholder="Entrez le téléphone du courtier"
                        className={formErrors.brokerPhone ? "border-destructive" : ""}
                      />
                    </div>
                    <FormError error={formErrors.brokerPhone} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-6">
            <h4 className="font-medium mb-4">Génération de la bannière</h4>
            {!bannerUrl ? (
              <div className="flex flex-col items-center justify-center py-4">
                {isGeneratingBanner ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Création de la bannière en cours...
                    </p>
                  </div>
                ) : (
                  <>
                    <Button 
                      onClick={generateBanner} 
                      disabled={isGeneratingBanner}
                      className="w-full"
                    >
                      {isGeneratingBanner ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Génération en cours...
                        </>
                      ) : "Générer la bannière"}
                    </Button>
                    
                    {Object.entries(formErrors).length > 0 && (
                      <div className="text-sm text-red-500 mt-2">
                        Veuillez remplir correctement tous les champs requis.
                      </div>
                    )}
                    
                    {bannerError && (
                      <div className="text-sm text-red-500 mt-2">
                        {bannerError}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-500 flex items-center gap-1">
                    <Tag className="w-4 h-4" /> Bannière générée avec succès
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // This would reset the banner state in the parent
                    }}
                  >
                    Régénérer
                  </Button>
                </div>
                
                <div className="border rounded-md p-2 bg-muted/20">
                  <img src={bannerUrl} alt="Bannière générée" className="max-h-[200px] mx-auto" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

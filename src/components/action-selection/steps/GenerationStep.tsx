
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PublicationType, SocialNetworks } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

type GenerationStepProps = {
  selectedPublicationTypes: PublicationType[];
  selectedNetworks: SocialNetworks;
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  selectedMusic?: string;
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowRenderId: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  setFormErrors: (errors: {[key: string]: string}) => void;
  onRegenerateSlideshow?: () => void;
  onRegenerateBanner?: () => void;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  refetchSlideshowStatus: () => void;
};

export const GenerationStep = ({
  selectedPublicationTypes,
  selectedNetworks,
  selectedImages,
  bannerImage,
  bannerType,
  selectedMusic,
  generateSlideshow,
  generateBanner,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowRenderId,
  slideshowError,
  bannerError,
  brokerImageUrl,
  agencyLogoUrl,
  brokerName,
  brokerEmail,
  brokerPhone,
  setFormErrors,
  onRegenerateSlideshow,
  onRegenerateBanner,
  slideshowUrl,
  bannerUrl,
  refetchSlideshowStatus
}: GenerationStepProps) => {
  const [generationStep, setGenerationStep] = useState<"none" | "slideshow" | "banner">("none");
  
  // Polling pour le statut du diaporama
  useEffect(() => {
    let interval: number | undefined;
    if (slideshowRenderId && !slideshowUrl) {
      interval = setInterval(() => {
        refetchSlideshowStatus();
      }, 5000) as unknown as number;
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [slideshowRenderId, slideshowUrl, refetchSlideshowStatus]);
  
  const handleGenerateSlideshow = async () => {
    await generateSlideshow();
  };
  
  const handleGenerateBanner = async () => {
    await generateBanner();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 4: Générer les médias</h3>
      
      <div className="space-y-4">
        {selectedPublicationTypes.includes("slideshow") && (
          <Card>
            <CardHeader>
              <CardTitle>Diaporama</CardTitle>
              <CardDescription>
                Générer un diaporama à partir des {selectedImages.length} photos sélectionnées
                {selectedMusic ? ` avec la musique "${selectedMusic}"` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slideshowUrl ? (
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p className="text-sm text-green-600">Diaporama généré avec succès!</p>
                  <div className="aspect-video w-full bg-muted/30 rounded-md overflow-hidden">
                    <video 
                      src={slideshowUrl} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : slideshowRenderId ? (
                <div className="flex flex-col items-center space-y-2 p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Diaporama en cours de génération...
                  </p>
                </div>
              ) : slideshowError ? (
                <div className="flex flex-col items-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-sm text-destructive">{slideshowError}</p>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="flex justify-end">
              {!slideshowUrl && !slideshowRenderId ? (
                <Button 
                  onClick={handleGenerateSlideshow} 
                  disabled={isGeneratingSlideshow || selectedImages.length === 0}
                >
                  {isGeneratingSlideshow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : "Générer le diaporama"}
                </Button>
              ) : slideshowUrl ? (
                <Button 
                  variant="outline" 
                  onClick={onRegenerateSlideshow}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Régénérer
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        )}
        
        {selectedPublicationTypes.includes("banner") && (
          <Card>
            <CardHeader>
              <CardTitle>Bannière {bannerType === "VENDU" ? "VENDU" : "À VENDRE"}</CardTitle>
              <CardDescription>
                Générer une bannière avec l'image et les informations du courtier
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bannerUrl ? (
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p className="text-sm text-green-600">Bannière générée avec succès!</p>
                  <div className="w-full rounded-md overflow-hidden">
                    <img 
                      src={bannerUrl} 
                      alt="Bannière générée" 
                      className="w-full object-contain"
                    />
                  </div>
                </div>
              ) : bannerError ? (
                <div className="flex flex-col items-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-sm text-destructive">{bannerError}</p>
                </div>
              ) : isGeneratingBanner ? (
                <div className="flex flex-col items-center space-y-2 p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Bannière en cours de génération...
                  </p>
                </div>
              ) : (
                <div className="bg-muted/30 p-4 rounded-md">
                  <p className="text-sm">
                    <strong>Image sélectionnée:</strong> {bannerImage ? "✓" : "✗"}
                  </p>
                  <p className="text-sm">
                    <strong>Type de bannière:</strong> {bannerType === "VENDU" ? "VENDU" : "À VENDRE"}
                  </p>
                  <p className="text-sm">
                    <strong>Nom du courtier:</strong> {brokerName || "Non défini"}
                  </p>
                  <p className="text-sm">
                    <strong>Email du courtier:</strong> {brokerEmail || "Non défini"}
                  </p>
                  <p className="text-sm">
                    <strong>Téléphone du courtier:</strong> {brokerPhone || "Non défini"}
                  </p>
                  <p className="text-sm">
                    <strong>Image du courtier:</strong> {brokerImageUrl ? "✓" : "✗"}
                  </p>
                  <p className="text-sm">
                    <strong>Logo de l'agence:</strong> {agencyLogoUrl ? "✓" : "✗"}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              {!bannerUrl ? (
                <Button 
                  onClick={handleGenerateBanner} 
                  disabled={isGeneratingBanner || !bannerImage}
                >
                  {isGeneratingBanner ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : "Générer la bannière"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={onRegenerateBanner}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Régénérer
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

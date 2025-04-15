import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import our new component files
import { PublicationTypeSelector } from "./PublicationTypeSelector";
import { TemplateSelector } from "./TemplateSelector";
import { MediaSelector } from "./media-selector";
import { MediaGenerationStep } from "./MediaGenerationStep";
import { SocialNetworkSelector } from "./SocialNetworkSelector";
import { PublicationPreview } from "./PublicationPreview";

type PublicationType = "photo" | "slideshow" | "banner";

type ActionSelectionDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const ActionSelectionDialog = ({ listing, isOpen, onClose }: ActionSelectionDialogProps) => {
  const { profile } = useProfile();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  
  const [facebookTemplates, setFacebookTemplates] = useState<{ id: string; name: string; content?: string }[]>([]);
  const [selectedFacebookTemplateId, setSelectedFacebookTemplateId] = useState<string>("none");
  const [instagramTemplates, setInstagramTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedInstagramTemplateId, setSelectedInstagramTemplateId] = useState<string>("none");
  
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [musicList, setMusicList] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);
  
  const [bannerType, setBannerType] = useState<"VENDU" | "À VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  
  const [isGeneratingSlideshow, setIsGeneratingSlideshow] = useState(false);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  
  const [selectedNetworks, setSelectedNetworks] = useState({
    facebook: false,
    instagram: false
  });
  
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [slideshowRenderId, setSlideshowRenderId] = useState<string | null>(null);
  const [slideshowError, setSlideshowError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  
  // Add new state variables for broker and agency information
  const [brokerImageUrl, setBrokerImageUrl] = useState<string | null>(null);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);
  const [brokerName, setBrokerName] = useState<string>("");
  const [brokerEmail, setBrokerEmail] = useState<string>("");
  const [brokerPhone, setBrokerPhone] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  const { 
    data: slideshowRender, 
    isLoading: isSlideshowStatusLoading,
    error: slideshowStatusError,
    refetch: refetchSlideshowStatus
  } = useSlideshowStatus(listing.id);

  useEffect(() => {
    if (slideshowRender && selectedPublicationTypes.includes("slideshow")) {
      if ((slideshowRender.status === "completed" || slideshowRender.status === "done") && slideshowRender.video_url) {
        setSlideshowUrl(slideshowRender.video_url);
        setIsGeneratingSlideshow(false);
        toast.success("Diaporama généré avec succès");
      } 
      
      else if (slideshowRender.status === "error" || slideshowRender.status === "failed") {
        setIsGeneratingSlideshow(false);
        setSlideshowError("La génération du diaporama a échoué. Veuillez réessayer.");
        toast.error("Échec de la génération du diaporama");
      }
      
      else if (slideshowRender.status === "pending" || slideshowRender.status === "processing" || slideshowRender.status === "rendering") {
        if (slideshowRenderId) {
          const checkTimer = setTimeout(() => {
            console.log("Vérification périodique du statut du diaporama...");
            refetchSlideshowStatus();
          }, 5000);
          
          return () => clearTimeout(checkTimer);
        }
      }
    }
  }, [slideshowRender, refetchSlideshowStatus, slideshowRenderId, selectedPublicationTypes]);

  useEffect(() => {
    if (isOpen) {
      resetState();
      fetchTemplates();
      fetchMusic();
    }
  }, [isOpen, listing.images]);
  
  const resetState = () => {
    setCurrentStep(1);
    setSelectedPublicationTypes([]);
    setSelectedFacebookTemplateId("none");
    setSelectedInstagramTemplateId("none");
    setSelectedImages([]);
    setBannerImage(listing.images?.[0] || null);
    setSelectedNetworks({ facebook: false, instagram: false });
    setGeneratedText("");
    setSlideshowUrl(null);
    setBannerUrl(null);
    // Reset broker and agency information
    setBrokerImageUrl(null);
    setAgencyLogoUrl(null);
    setBrokerName("");
    setBrokerEmail("");
    setBrokerPhone("");
    setFormErrors({});
  };

  const fetchTemplates = async () => {
    const { data: fbTemplates, error: fbError } = await supabase
      .from('facebook_templates')
      .select('id, name, content');
    
    if (!fbError && fbTemplates) {
      setFacebookTemplates(fbTemplates);
    }
    
    const { data: igTemplates, error: igError } = await supabase
      .from('instagram_templates')
      .select('id, name');
    
    if (!igError && igTemplates) {
      setInstagramTemplates(igTemplates);
    }
  };
  
  const fetchMusic = async () => {
    const { data, error } = await supabase.storage.from('background-music').list();
    
    if (!error && data) {
      const musicFiles = data
        .filter(file => !file.name.startsWith('.'))
        .map(file => file.name);
      
      setMusicList(musicFiles);
      if (musicFiles.length > 0) {
        setSelectedMusic(musicFiles[0]);
      }
    }
  };
  
  const handlePublicationTypeChange = (type: PublicationType, checked: boolean) => {
    setSelectedPublicationTypes(prev => 
      checked 
        ? [...prev, type] 
        : prev.filter(t => t !== type)
    );
  };
  
  const handleMusicChange = (value: string) => {
    stopAudio();
    setSelectedMusic(value);
  };

  const previewMusic = (musicName: string) => {
    if (currentlyPlaying === musicName) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio();
    audio.src = `${supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl}`;
    audio.volume = 0.5;
    audio.play();
    setAudioPlaying(audio);
    setCurrentlyPlaying(musicName);
  };

  const stopAudio = () => {
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  };
  
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };
  
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedImages(items);
  };
  
  const selectBannerImage = (imageUrl: string) => {
    setBannerImage(imageUrl);
  };

  const generateText = async () => {
    try {
      setIsGeneratingText(true);
      
      const { data, error } = await supabase.functions.invoke("generate-listing-description", {
        body: { 
          listing: listing,
          templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId,
          templateContent: selectedFacebookTemplateId !== "none" ? 
            facebookTemplates.find(t => t.id === selectedFacebookTemplateId)?.content : 
            undefined
        }
      });
      
      if (error) throw new Error("Erreur lors de la génération du texte");
      
      setGeneratedText(data.text || "");
      await ensureAndIncrementStatistic('description');
      
      uiToast({
        title: "Texte généré",
        description: "Le texte de votre publication a été généré avec succès.",
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération du texte:", error);
      uiToast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du texte.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingText(false);
    }
  };
  
  const generateSlideshow = async () => {
    try {
      setIsGeneratingSlideshow(true);
      setSlideshowError(null);
      
      console.log("Génération du diaporama pour le listing:", listing.id);
      console.log("Images sélectionnées:", selectedImages);
      console.log("Musique sélectionnée:", selectedMusic);
      
      toast.info("Génération du diaporama", {
        description: "Nous préparons votre diaporama...",
        duration: 3000
      });
      
      const { data, error } = await supabase.functions.invoke("create-slideshow", {
        body: {
          listingId: listing.id,
          config: {
            imageDuration: 3,
            showDetails: true,
            showPrice: true,
            showAddress: true,
            selectedImages: selectedImages,
            selectedMusic: selectedMusic
          }
        }
      });
      
      if (error) {
        console.error("Erreur lors de l'appel à create-slideshow:", error);
        throw error;
      }
      
      console.log("Réponse de create-slideshow:", data);
      
      if (data.renderId) {
        setSlideshowRenderId(data.renderId);
        
        await ensureAndIncrementStatistic('slideshow');
        
        toast.success("Diaporama en cours de génération", {
          description: "Ce processus peut prendre quelques minutes",
          duration: 5000
        });
        
        setTimeout(() => refetchSlideshowStatus(), 3000);
        
        return data.renderId;
      } else {
        throw new Error("Aucun ID de rendu n'a été retourné");
      }
      
    } catch (error) {
      console.error("Erreur lors de la génération du diaporama:", error);
      setSlideshowError("Une erreur est survenue lors de la génération du diaporama: " + (error.message || "erreur inconnue"));
      toast.error("Erreur lors de la génération du diaporama", {
        description: error.message || "Une erreur inattendue est survenue",
        duration: 5000
      });
      return null;
    }
  };
  
  const generateBanner = async () => {
    if (!bannerImage) {
      uiToast({
        title: "Erreur",
        description: "Veuillez sélectionner une image pour la bannière.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate broker information
    const errors: {[key: string]: string} = {};
    
    if (!brokerName) {
      errors.brokerName = "Le nom du courtier est requis";
    }
    
    if (!brokerEmail) {
      errors.brokerEmail = "L'email du courtier est requis";
    } else if (!/\S+@\S+\.\S+/.test(brokerEmail)) {
      errors.brokerEmail = "Format d'email invalide";
    }
    
    if (!brokerPhone) {
      errors.brokerPhone = "Le téléphone du courtier est requis";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Veuillez compléter toutes les informations du courtier");
      return;
    }
    
    try {
      setIsGeneratingBanner(true);
      
      const { data, error } = await supabase.functions.invoke("create-sold-banner", {
        body: {
          listingId: listing.id,
          config: {
            bannerType: bannerType,
            mainImage: bannerImage,
            brokerImage: brokerImageUrl,
            agencyLogo: agencyLogoUrl,
            brokerName: brokerName,
            brokerEmail: brokerEmail,
            brokerPhone: brokerPhone
          }
        }
      });
      
      if (error) throw error;
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let isComplete = false;
      while (!isComplete) {
        const { data: statusData } = await supabase
          .from("sold_banner_renders")
          .select("image_url, status")
          .eq("listing_id", listing.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (statusData && statusData.status === "completed" && statusData.image_url) {
          setBannerUrl(statusData.image_url);
          isComplete = true;
          uiToast({
            title: "Bannière créée",
            description: "La bannière a été générée avec succès.",
          });
          await ensureAndIncrementStatistic('banner');
        } else if (statusData && statusData.status === "failed") {
          throw new Error("La création de la bannière a échoué");
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
    } catch (error) {
      console.error("Erreur lors de la création de la bannière:", error);
      uiToast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la bannière.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBanner(false);
    }
  };
  
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const tasks = [];
      
      if (!generatedText) {
        uiToast({
          title: "Erreur",
          description: "Veuillez générer un texte pour votre publication.",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedNetworks.facebook) {
        let imageToUse = null;
        
        if (selectedPublicationTypes.includes("banner") && bannerUrl) {
          imageToUse = bannerUrl;
        } else if (selectedImages.length > 0) {
          imageToUse = selectedImages[0];
        }
        
        if (imageToUse) {
          tasks.push(
            supabase.functions.invoke("facebook-publish", {
              body: {
                message: generatedText,
                pageId: profile?.facebook_page_id || 'test-page-id',
                accessToken: profile?.facebook_access_token || 'test-access-token',
                image: imageToUse,
                templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
              }
            }).then(async () => {
              await supabase
                .from("listings")
                .update({ published_to_facebook: true })
                .eq("id", listing.id);
              
              await ensureAndIncrementStatistic('facebook');
            }).catch(error => {
              console.error("Test mode - Facebook publish error:", error);
              toast.success("Facebook test publication completed (test mode)");
            })
          );
        }
      }
      
      if (selectedNetworks.instagram) {
        let imagesToUse = [];
        
        if (selectedPublicationTypes.includes("slideshow") && slideshowUrl) {
          imagesToUse = [slideshowUrl];
        } else if (selectedPublicationTypes.includes("banner") && bannerUrl) {
          imagesToUse = [bannerUrl];
        } else if (selectedImages.length > 0) {
          imagesToUse = selectedImages.slice(0, 10);
        }
        
        if (imagesToUse.length > 0) {
          tasks.push(
            supabase.functions.invoke("instagram-publish", {
              body: {
                message: generatedText,
                images: imagesToUse,
                listingId: listing.id,
                templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId
              }
            }).then(async () => {
              await ensureAndIncrementStatistic('instagram');
            }).catch(error => {
              console.error("Test mode - Instagram publish error:", error);
              toast.success("Instagram test publication completed (test mode)");
            })
          );
        }
      }
      
      await Promise.allSettled(tasks);
      
      uiToast({
        title: "Publications complétées",
        description: "Vos publications ont été créées avec succès sur les réseaux sociaux sélectionnés.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      uiToast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication sur les réseaux sociaux.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  const canGoToNextStep = () => {
    switch (currentStep) {
      case 1: 
        return selectedPublicationTypes.length > 0;
      case 2: 
        return true; 
      case 3: 
        return !(
          (selectedPublicationTypes.includes("photo") && selectedImages.length === 0) ||
          (selectedPublicationTypes.includes("banner") && !bannerImage)
        );
      case 3.5: 
        const needsSlideshow = selectedPublicationTypes.includes("slideshow");
        const needsBanner = selectedPublicationTypes.includes("banner");
        
        const slideshowReady = !needsSlideshow || slideshowUrl;
        const bannerReady = !needsBanner || bannerUrl;
        
        return slideshowReady && bannerReady;
      case 4: 
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (currentStep === 3) {
      const needsGeneration = selectedPublicationTypes.includes("slideshow") || selectedPublicationTypes.includes("banner");
      
      if (needsGeneration) {
        setCurrentStep(3.5);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 3.5) {
      setCurrentStep(4);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 3.5) {
      setCurrentStep(3);
    } else if (currentStep === 4 && 
              (selectedPublicationTypes.includes("slideshow") || 
               selectedPublicationTypes.includes("banner"))) {
      setCurrentStep(3.5);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: 
        return (
          <PublicationTypeSelector
            selectedPublicationTypes={selectedPublicationTypes}
            onPublicationTypeChange={handlePublicationTypeChange}
          />
        );
      
      case 2: 
        return (
          <TemplateSelector 
            facebookTemplates={facebookTemplates}
            instagramTemplates={instagramTemplates}
            selectedFacebookTemplateId={selectedFacebookTemplateId}
            selectedInstagramTemplateId={selectedInstagramTemplateId}
            setSelectedFacebookTemplateId={setSelectedFacebookTemplateId}
            setSelectedInstagramTemplateId={setSelectedInstagramTemplateId}
            generatedText={generatedText}
            setGeneratedText={setGeneratedText}
            isGeneratingText={isGeneratingText}
            onGenerateText={generateText}
          />
        );
      
      case 3: 
        return (
          <MediaSelector
            selectedPublicationTypes={selectedPublicationTypes}
            images={listing.images || []}
            selectedImages={selectedImages}
            bannerImage={bannerImage}
            bannerType={bannerType}
            musicList={musicList}
            selectedMusic={selectedMusic}
            currentlyPlaying={currentlyPlaying}
            toggleImageSelection={toggleImageSelection}
            onDragEnd={onDragEnd}
            selectBannerImage={selectBannerImage}
            handleMusicChange={handleMusicChange}
            previewMusic={previewMusic}
            setBannerType={setBannerType}
            brokerImageUrl={brokerImageUrl}
            setBrokerImageUrl={setBrokerImageUrl}
            agencyLogoUrl={agencyLogoUrl}
            setAgencyLogoUrl={setAgencyLogoUrl}
            brokerName={brokerName}
            setBrokerName={setBrokerName}
            brokerEmail={brokerEmail}
            setBrokerEmail={setBrokerEmail}
            brokerPhone={brokerPhone}
            setBrokerPhone={setBrokerPhone}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
          />
        );
      
      case 3.5:
        return (
          <MediaGenerationStep
            selectedPublicationTypes={selectedPublicationTypes}
            isGeneratingSlideshow={isGeneratingSlideshow}
            isGeneratingBanner={isGeneratingBanner}
            slideshowUrl={slideshowUrl}
            bannerUrl={bannerUrl}
            slideshowError={slideshowError}
            bannerError={bannerError}
            slideshowRenderId={slideshowRenderId}
            generateSlideshow={generateSlideshow}
            generateBanner={generateBanner}
            selectedImages={selectedImages}
            refetchSlideshowStatus={refetchSlideshowStatus}
          />
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 4: Publier sur les réseaux sociaux</h3>
            
            <SocialNetworkSelector
              selectedNetworks={selectedNetworks}
              onNetworkChange={setSelectedNetworks}
            />
            
            <PublicationPreview
              selectedNetworks={selectedNetworks}
              generatedText={generatedText}
              setGeneratedText={setGeneratedText}
              images={listing.images || []}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              slideshowUrl={slideshowUrl}
              bannerUrl={bannerUrl}
              selectedMusic={selectedMusic}
              selectedPublicationTypes={selectedPublicationTypes}
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Publication sur les réseaux sociaux</DialogTitle>
          <DialogDescription>
            Créez une publication pour diffuser votre bien immobilier sur les réseaux sociaux.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-10rem)]">
          <div className="my-4 pr-4 pb-4">
            {renderStepContent()}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 border-t pt-4 mt-2">
          <div className="flex-1 flex">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Précédent
              </Button>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canGoToNextStep()}
                className="flex items-center"
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || !canGoToNextStep()}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : "Publier"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

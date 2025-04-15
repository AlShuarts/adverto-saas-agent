
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";

// Import our hooks
import { useTemplates } from "./hooks/useTemplates";
import { useTextGeneration } from "./hooks/useTextGeneration";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useMediaGeneration } from "./hooks/useMediaGeneration";
import { useSocialPublishing } from "./hooks/useSocialPublishing";

// Import our new component files
import { PublicationTypeSelector } from "./PublicationTypeSelector";
import { TemplateSelector } from "./TemplateSelector";
import { MediaSelector } from "./media-selector";
import { SlideshowStep } from "./steps/SlideshowStep";
import { BannerStep } from "./steps/BannerStep";
import { SocialNetworkSelector } from "./SocialNetworkSelector";
import { PublicationPreview } from "./PublicationPreview";
import { StepNavigation } from "./steps/StepNavigation";

type PublicationType = "photo" | "slideshow" | "banner";

type ActionSelectionDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const ActionSelectionDialog = ({ listing, isOpen, onClose }: ActionSelectionDialogProps) => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [bannerType, setBannerType] = useState<"VENDU" | "À VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState({
    facebook: false,
    instagram: false
  });
  
  // Add state for broker and agency information
  const [brokerImageUrl, setBrokerImageUrl] = useState<string | null>(null);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);
  const [brokerName, setBrokerName] = useState<string>("");
  const [brokerEmail, setBrokerEmail] = useState<string>("");
  const [brokerPhone, setBrokerPhone] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Import custom hooks
  const { 
    facebookTemplates, 
    instagramTemplates, 
    selectedFacebookTemplateId, 
    selectedInstagramTemplateId,
    setSelectedFacebookTemplateId,
    setSelectedInstagramTemplateId,
    fetchTemplates,
    resetTemplates
  } = useTemplates();
  
  const {
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText
  } = useTextGeneration(listing);
  
  const {
    audioPlaying,
    currentlyPlaying,
    musicList,
    selectedMusic,
    fetchMusic,
    handleMusicChange,
    previewMusic,
    stopAudio
  } = useAudioPlayer();
  
  const {
    isGeneratingSlideshow,
    isGeneratingBanner,
    slideshowUrl,
    bannerUrl,
    slideshowError,
    bannerError,
    slideshowRenderId,
    setSlideshowUrl,
    setBannerUrl,
    setIsGeneratingSlideshow,
    setSlideshowRenderId,
    setIsGeneratingBanner, // Add this missing import
    generateSlideshow,
    generateBanner
  } = useMediaGeneration(listing.id);
  
  const {
    isPublishing,
    publish
  } = useSocialPublishing(listing, profile);
  
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
    resetTemplates();
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

  const handlePublicationTypeChange = (type: PublicationType, checked: boolean) => {
    setSelectedPublicationTypes(prev => 
      checked 
        ? [...prev, type] 
        : prev.filter(t => t !== type)
    );
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

  const handleGenerateText = async () => {
    await generateText(selectedFacebookTemplateId, facebookTemplates);
  };
  
  const handleGenerateSlideshow = async () => {
    await generateSlideshow(selectedImages, selectedMusic);
  };
  
  const handleGenerateBanner = async () => {
    const result = await generateBanner(
      bannerImage,
      bannerType,
      {
        brokerImageUrl,
        agencyLogoUrl,
        brokerName,
        brokerEmail,
        brokerPhone
      }
    );
    
    if (result?.errors) {
      setFormErrors(result.errors);
    }
  };
  
  const handlePublish = async () => {
    const result = await publish(
      selectedNetworks,
      selectedPublicationTypes,
      generatedText,
      selectedImages,
      bannerUrl,
      slideshowUrl,
      selectedFacebookTemplateId,
      selectedInstagramTemplateId
    );
    
    if (result.success) {
      onClose();
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
            onGenerateText={handleGenerateText}
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
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 3.5: Génération des médias</h3>
            
            {selectedPublicationTypes.includes("slideshow") && (
              <SlideshowStep
                isGeneratingSlideshow={isGeneratingSlideshow}
                slideshowUrl={slideshowUrl}
                slideshowError={slideshowError}
                slideshowRenderId={slideshowRenderId}
                selectedImages={selectedImages}
                onGenerateSlideshow={handleGenerateSlideshow}
                onRegenerateSlideshow={() => {
                  setSlideshowUrl(null);
                  setSlideshowRenderId(null);
                  setIsGeneratingSlideshow(false);
                }}
                onCheckStatus={refetchSlideshowStatus}
              />
            )}
            
            {selectedPublicationTypes.includes("banner") && (
              <BannerStep
                isGeneratingBanner={isGeneratingBanner}
                bannerUrl={bannerUrl}
                bannerError={bannerError}
                onGenerateBanner={handleGenerateBanner}
                onRegenerateBanner={() => {
                  setBannerUrl(null);
                  setIsGeneratingBanner(false); // Fixed: using the proper setter function
                }}
              />
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 4: Publier sur les réseaux sociaux</h3>
            
            <SocialNetworkSelector
              selectedNetworks={selectedNetworks}
              onNetworkChange={(networks) => setSelectedNetworks(networks)} // Fixed: ensuring we pass a boolean type
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
        
        <DialogFooter>
          <StepNavigation 
            currentStep={currentStep}
            isPublishing={isPublishing}
            canGoToNextStep={canGoToNextStep()}
            onPrevious={prevStep}
            onNext={nextStep}
            onPublish={handlePublish}
            onCancel={onClose}
            isLastStep={currentStep === 4}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add missing imports at the top
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

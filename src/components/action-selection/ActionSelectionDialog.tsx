import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Import our hooks
import { useTemplates } from "./hooks/useTemplates";
import { useTextGeneration } from "./hooks/useTextGeneration";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useMediaGeneration } from "./hooks/useMediaGeneration";
import { useSocialPublishing } from "./hooks/useSocialPublishing";

// Import our step components
import { PublicationStep } from "./steps/PublicationStep";
import { TemplateStep } from "./steps/TemplateStep";
import { MediaStep } from "./steps/MediaStep";
import { GenerationStep } from "./steps/GenerationStep";
import { SocialStep } from "./steps/SocialStep";
import { StepNavigation } from "./steps/StepNavigation";
import { PublicationType, SocialNetworks } from "./types";

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
  const [selectedNetworks, setSelectedNetworks] = useState<SocialNetworks>({
    facebook: false,
    instagram: false
  });
  
  const [brokerImageUrl, setBrokerImageUrl] = useState<string | null>(null);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);
  const [brokerName, setBrokerName] = useState<string>("");
  const [brokerEmail, setBrokerEmail] = useState<string>("");
  const [brokerPhone, setBrokerPhone] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

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
    setIsGeneratingBanner,
    setSlideshowRenderId,
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
    return await generateSlideshow(selectedImages, selectedMusic);
  };
  
  const handleGenerateBanner = async () => {
    return await generateBanner(
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
      queryClient.invalidateQueries({ queryKey: ["listings"] });
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
          <PublicationStep
            selectedPublicationTypes={selectedPublicationTypes}
            onPublicationTypeChange={handlePublicationTypeChange}
          />
        );
      
      case 2: 
        return (
          <TemplateStep
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
          <MediaStep
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
          <GenerationStep
            selectedPublicationTypes={selectedPublicationTypes}
            selectedNetworks={selectedNetworks}
            selectedImages={selectedImages}
            bannerImage={bannerImage}
            bannerType={bannerType}
            selectedMusic={selectedMusic}
            generateSlideshow={generateSlideshow}
            generateBanner={generateBanner}
            isGeneratingSlideshow={isGeneratingSlideshow}
            isGeneratingBanner={isGeneratingBanner}
            slideshowRenderId={slideshowRenderId}
            slideshowError={slideshowError}
            bannerError={bannerError}
            brokerImageUrl={brokerImageUrl}
            agencyLogoUrl={agencyLogoUrl}
            brokerName={brokerName}
            brokerEmail={brokerEmail}
            brokerPhone={brokerPhone}
            setFormErrors={setFormErrors}
            onRegenerateSlideshow={() => {
              setSlideshowUrl(null);
              setSlideshowRenderId(null);
              setIsGeneratingSlideshow(false);
            }}
            onRegenerateBanner={() => {
              setBannerUrl(null);
              setIsGeneratingBanner(false);
            }}
            slideshowUrl={slideshowUrl}
            bannerUrl={bannerUrl}
            refetchSlideshowStatus={refetchSlideshowStatus}
          />
        );
      
      case 4:
        return (
          <SocialStep
            selectedPublicationTypes={selectedPublicationTypes}
            selectedNetworks={selectedNetworks}
            setSelectedNetworks={setSelectedNetworks}
            isSubmitting={isPublishing}
            onSubmit={handlePublish}
            hasRequiredInfo={!!generatedText}
            generatedText={generatedText}
            setGeneratedText={setGeneratedText}
            images={listing.images || []}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            slideshowUrl={slideshowUrl}
            bannerUrl={bannerUrl}
            selectedMusic={selectedMusic}
          />
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

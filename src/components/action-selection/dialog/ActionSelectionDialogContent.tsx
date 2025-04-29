
import { useActionSelection } from "../context/ActionSelectionContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderStepContent } from "../steps/stepsRenderer";
import { StepNavigation } from "../steps/StepNavigation";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const ActionSelectionDialogContent = () => {
  const { 
    currentStep,
    onClose,
    nextStep,
    prevStep,
    canGoToNextStep,
    isPublishing,
    handlePublish,
    
    // Props for different steps
    selectedPublicationTypes,
    handlePublicationTypeChange,
    
    facebookTemplates,
    instagramTemplates,
    selectedFacebookTemplateId,
    selectedInstagramTemplateId,
    setSelectedFacebookTemplateId,
    setSelectedInstagramTemplateId,
    isGeneratingText,
    generatedText,
    setGeneratedText,
    handleGenerateText,
    
    selectedImages,
    setSelectedImages,
    bannerImage,
    bannerType,
    musicList,
    selectedMusic,
    currentlyPlaying,
    toggleImageSelection,
    onDragEnd,
    selectBannerImage,
    handleMusicChange,
    previewMusic,
    setBannerType,
    brokerImageUrl,
    setBrokerImageUrl,
    agencyLogoUrl,
    setAgencyLogoUrl,
    brokerName,
    setBrokerName,
    brokerEmail,
    setBrokerEmail,
    brokerPhone,
    setBrokerPhone,
    formErrors,
    setFormErrors,
    
    isGeneratingSlideshow,
    isGeneratingBanner,
    slideshowUrl,
    bannerUrl,
    slideshowError,
    bannerError,
    slideshowRenderId,
    bannerRenderId,
    handleGenerateSlideshow,
    handleGenerateBanner,
    refetchSlideshowStatus,
    
    selectedNetworks,
    setSelectedNetworks,
    handleNetworkChange,
    
    listing
  } = useActionSelection();

  // Wrapper functions to match the expected types
  const generateSlideshowWrapper = async () => {
    return handleGenerateSlideshow();
  };

  const generateBannerWrapper = async () => {
    const result = await handleGenerateBanner();
    if (result?.errors) {
      setFormErrors(result.errors);
    }
    return;
  };

  // Wrapper function for publish
  const handlePublishWrapper = async () => {
    await handlePublish();
  };

  // Helper functions for regeneration
  const handleRegenerateSlideshow = () => {
    // Reset slideshow state here
    // No-op for now
  };

  const handleRegenerateBanner = () => {
    // Reset banner state here
    // No-op for now
  };

  return (
    <DialogContent className="max-w-4xl bg-gray-950 text-white border-gray-800 overflow-hidden flex flex-col max-h-[95vh]">
      <DialogHeader>
        <DialogTitle className="text-white">Publication sur les réseaux sociaux</DialogTitle>
        <DialogDescription className="text-gray-400">
          Créez une publication pour diffuser votre bien immobilier sur les réseaux sociaux.
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="flex-1 overflow-auto pr-4">
        <div className="my-4 px-2 pb-4">
          {renderStepContent({
            currentStep,
            selectedPublicationTypes,
            handlePublicationTypeChange,
            facebookTemplates,
            instagramTemplates,
            selectedFacebookTemplateId,
            selectedInstagramTemplateId,
            setSelectedFacebookTemplateId,
            setSelectedInstagramTemplateId,
            generatedText,
            setGeneratedText,
            isGeneratingText,
            handleGenerateText,
            listing,
            selectedImages,
            setSelectedImages,
            bannerImage,
            bannerType,
            musicList,
            selectedMusic,
            currentlyPlaying,
            toggleImageSelection,
            onDragEnd,
            selectBannerImage,
            handleMusicChange,
            previewMusic,
            setBannerType,
            brokerImageUrl,
            setBrokerImageUrl,
            agencyLogoUrl,
            setAgencyLogoUrl,
            brokerName,
            setBrokerName,
            brokerEmail,
            setBrokerEmail,
            brokerPhone,
            setBrokerPhone,
            formErrors,
            setFormErrors,
            isGeneratingSlideshow,
            isGeneratingBanner,
            slideshowUrl,
            bannerUrl,
            slideshowError,
            bannerError,
            slideshowRenderId,
            bannerRenderId,
            generateSlideshowWrapper,
            generateBannerWrapper,
            refetchSlideshowStatus,
            handleRegenerateSlideshow,
            handleRegenerateBanner,
            selectedNetworks,
            setSelectedNetworks,
            handleNetworkChange,
            isPublishing,
            handlePublishWrapper
          })}
        </div>
      </ScrollArea>
      
      <DialogFooter className="border-t border-gray-800 pt-4 mt-2">
        <StepNavigation 
          currentStep={currentStep}
          isPublishing={isPublishing}
          canGoToNextStep={canGoToNextStep()}
          onPrevious={prevStep}
          onNext={nextStep}
          onPublish={handlePublishWrapper}
          onCancel={onClose}
          isLastStep={currentStep === 5}
        />
      </DialogFooter>
    </DialogContent>
  );
};

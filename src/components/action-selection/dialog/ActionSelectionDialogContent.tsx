
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useActionSelection } from "../context/ActionSelectionContext";
import { ActionSelectionSteps } from "./ActionSelectionSteps";
import { StepNavigation } from "../steps/StepNavigation";

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
    <DialogContent className="max-w-4xl bg-gray-950 text-white border-gray-800">
      <DialogHeader>
        <DialogTitle className="text-white">Publication sur les réseaux sociaux</DialogTitle>
        <DialogDescription className="text-gray-400">
          Créez une publication pour diffuser votre bien immobilier sur les réseaux sociaux.
        </DialogDescription>
      </DialogHeader>

      <ActionSelectionSteps
        currentStep={currentStep}
        selectedPublicationTypes={selectedPublicationTypes}
        handlePublicationTypeChange={handlePublicationTypeChange}
        facebookTemplates={facebookTemplates}
        instagramTemplates={instagramTemplates}
        selectedFacebookTemplateId={selectedFacebookTemplateId}
        selectedInstagramTemplateId={selectedInstagramTemplateId}
        setSelectedFacebookTemplateId={setSelectedFacebookTemplateId}
        setSelectedInstagramTemplateId={setSelectedInstagramTemplateId}
        generatedText={generatedText}
        setGeneratedText={setGeneratedText}
        isGeneratingText={isGeneratingText}
        handleGenerateText={handleGenerateText}
        listing={listing}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        bannerImage={bannerImage}
        bannerType={bannerType}
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
        isGeneratingSlideshow={isGeneratingSlideshow}
        isGeneratingBanner={isGeneratingBanner}
        slideshowUrl={slideshowUrl}
        bannerUrl={bannerUrl}
        slideshowError={slideshowError}
        bannerError={bannerError}
        slideshowRenderId={slideshowRenderId}
        generateSlideshow={generateSlideshowWrapper}
        generateBanner={generateBannerWrapper}
        refetchSlideshowStatus={refetchSlideshowStatus}
        handleRegenerateSlideshow={handleRegenerateSlideshow}
        handleRegenerateBanner={handleRegenerateBanner}
        selectedNetworks={selectedNetworks}
        setSelectedNetworks={setSelectedNetworks}
        isPublishing={isPublishing}
        handlePublish={handlePublishWrapper}
      />
      
      <DialogFooter className="border-t border-gray-800 pt-4">
        <StepNavigation 
          currentStep={currentStep}
          isPublishing={isPublishing}
          canGoToNextStep={canGoToNextStep()}
          onPrevious={prevStep}
          onNext={nextStep}
          onPublish={handlePublishWrapper}
          onCancel={onClose}
          isLastStep={currentStep === 4}
        />
      </DialogFooter>
    </DialogContent>
  );
};

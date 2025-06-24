
import { useActionSelection } from "../context/ActionSelectionContext";
import { DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ActionDialogHeader } from "./components/ActionDialogHeader";
import { ActionDialogBody } from "./components/ActionDialogBody";
import { ActionDialogFooter } from "./components/ActionDialogFooter";

export const ActionSelectionDialogContent = () => {
  const isMobile = useIsMobile();
  const { 
    currentStep,
    onClose,
    nextStep,
    prevStep,
    canGoToNextStep,
    isPublishing,
    handlePublish,
    
    // Props for different steps
    selectedPublicationType,
    selectedPhotoType,
    handlePublicationTypeChange,
    handlePhotoTypeChange,
    
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
    selectAllImages,
    deselectAllImages,
    
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
    <DialogContent className={`${
      isMobile 
        ? "max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-4" 
        : "max-w-5xl w-[90vw] max-h-[90vh] h-[90vh] p-6"
    } bg-gray-950 text-white border-gray-800 overflow-hidden flex flex-col`}>
      
      <ActionDialogHeader />
      
      <ActionDialogBody
        currentStep={currentStep}
        selectedPublicationType={selectedPublicationType}
        selectedPhotoType={selectedPhotoType}
        handlePublicationTypeChange={handlePublicationTypeChange}
        handlePhotoTypeChange={handlePhotoTypeChange}
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
        selectAllImages={selectAllImages}
        deselectAllImages={deselectAllImages}
        isGeneratingSlideshow={isGeneratingSlideshow}
        isGeneratingBanner={isGeneratingBanner}
        slideshowUrl={slideshowUrl}
        bannerUrl={bannerUrl}
        slideshowError={slideshowError}
        bannerError={bannerError}
        slideshowRenderId={slideshowRenderId}
        bannerRenderId={bannerRenderId}
        generateSlideshow={generateSlideshowWrapper}
        generateBanner={generateBannerWrapper}
        refetchSlideshowStatus={refetchSlideshowStatus}
        handleRegenerateSlideshow={handleRegenerateSlideshow}
        handleRegenerateBanner={handleRegenerateBanner}
        selectedNetworks={selectedNetworks}
        setSelectedNetworks={setSelectedNetworks}
        handleNetworkChange={handleNetworkChange}
        isPublishing={isPublishing}
        handlePublish={handlePublishWrapper}
      />
      
      <ActionDialogFooter
        currentStep={currentStep}
        isPublishing={isPublishing}
        canGoToNextStep={canGoToNextStep()}
        onPrevious={prevStep}
        onNext={nextStep}
        onPublish={handlePublishWrapper}
        onCancel={onClose}
      />
    </DialogContent>
  );
};

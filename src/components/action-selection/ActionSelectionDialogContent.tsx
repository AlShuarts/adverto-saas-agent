
import { useActionSelection } from "./context/ActionSelectionContext";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import step components
import { PublicationStep } from "./steps/PublicationStep";
import { TemplateStep } from "./steps/TemplateStep";
import { MediaStep } from "./steps/MediaStep";
import { GenerationStep } from "./steps/GenerationStep";
import { SocialStep } from "./steps/SocialStep";
import { StepNavigation } from "./steps/StepNavigation";

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
    handleGenerateSlideshow,
    handleGenerateBanner,
    refetchSlideshowStatus,
    
    selectedNetworks,
    setSelectedNetworks,
    handleNetworkChange,
    
    listing
  } = useActionSelection();

  // Wrapper functions to match the expected types in GenerationStep
  const generateSlideshowWrapper = async () => {
    return handleGenerateSlideshow();
  };

  const generateBannerWrapper = async () => {
    const result = await handleGenerateBanner();
    if (result.errors) {
      setFormErrors(result.errors);
    }
    return;
  };

  // Wrapper function to match the expected type in SocialStep
  const handlePublishWrapper = async () => {
    await handlePublish();
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
            generateSlideshow={generateSlideshowWrapper}
            generateBanner={generateBannerWrapper}
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
              // Reset slideshow state in useMediaGeneration
            }}
            onRegenerateBanner={() => {
              // Reset banner state in useMediaGeneration
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
            onSubmit={handlePublishWrapper}
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
          onPublish={handlePublishWrapper}
          onCancel={onClose}
          isLastStep={currentStep === 4}
        />
      </DialogFooter>
    </DialogContent>
  );
};

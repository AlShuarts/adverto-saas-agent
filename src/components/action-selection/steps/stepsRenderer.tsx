
import { PublicationStep } from "./PublicationStep";
import { PhotoTypeStep } from "./PhotoTypeStep";
import { TemplateStep } from "./TemplateStep";
import { MediaStep } from "./MediaStep";
import { SocialStep } from "./SocialStep";

export const renderStepContent = (props: any) => {
  const { currentStep, listing, nextStep } = props;
  
  switch (currentStep) {
    case 1:
      return (
        <PublicationStep
          selectedPublicationType={props.selectedPublicationType}
          onPublicationTypeChange={props.handlePublicationTypeChange}
          onAutoNext={nextStep}
        />
      );
    case 2:
      return (
        <PhotoTypeStep
          selectedPhotoType={props.selectedPhotoType}
          onPhotoTypeChange={props.handlePhotoTypeChange}
          onAutoNext={nextStep}
        />
      );
    case 3:
      return (
        <TemplateStep
          facebookTemplates={props.facebookTemplates}
          instagramTemplates={props.instagramTemplates}
          selectedFacebookTemplateId={props.selectedFacebookTemplateId}
          selectedInstagramTemplateId={props.selectedInstagramTemplateId}
          setSelectedFacebookTemplateId={props.setSelectedFacebookTemplateId}
          setSelectedInstagramTemplateId={props.setSelectedInstagramTemplateId}
          generatedText={props.generatedText}
          setGeneratedText={props.setGeneratedText}
          isGeneratingText={props.isGeneratingText}
          onGenerateText={props.handleGenerateText}
        />
      );
    case 4:
      return (
        <MediaStep
          selectedPublicationType={props.selectedPublicationType}
          selectedPhotoType={props.selectedPhotoType}
          images={listing?.images || []}
          selectedImages={props.selectedImages}
          bannerImage={props.bannerImage}
          bannerType={props.bannerType}
          musicList={props.musicList}
          selectedMusic={props.selectedMusic}
          currentlyPlaying={props.currentlyPlaying}
          toggleImageSelection={props.toggleImageSelection}
          selectAllImages={props.selectAllImages}
          deselectAllImages={props.deselectAllImages}
          onDragEnd={props.onDragEnd}
          selectBannerImage={props.selectBannerImage}
          handleMusicChange={props.handleMusicChange}
          previewMusic={props.previewMusic}
          setBannerType={props.setBannerType}
          brokerImageUrl={props.brokerImageUrl}
          setBrokerImageUrl={props.setBrokerImageUrl}
          agencyLogoUrl={props.agencyLogoUrl}
          setAgencyLogoUrl={props.setAgencyLogoUrl}
          brokerName={props.brokerName}
          setBrokerName={props.setBrokerName}
          brokerEmail={props.brokerEmail}
          setBrokerEmail={props.setBrokerEmail}
          brokerPhone={props.brokerPhone}
          setBrokerPhone={props.setBrokerPhone}
          formErrors={props.formErrors}
          setFormErrors={props.setFormErrors}
          listing={listing}
          isGeneratingSlideshow={props.isGeneratingSlideshow}
          isGeneratingBanner={props.isGeneratingBanner}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          slideshowError={props.slideshowError}
          bannerError={props.bannerError}
          slideshowRenderId={props.slideshowRenderId}
          bannerRenderId={props.bannerRenderId}
          generateSlideshow={props.generateSlideshowWrapper}
          generateBanner={props.generateBannerWrapper}
          refetchSlideshowStatus={props.refetchSlideshowStatus}
          handleRegenerateSlideshow={props.handleRegenerateSlideshow}
          handleRegenerateBanner={props.handleRegenerateBanner}
        />
      );
    case 5:
      return (
        <SocialStep
          selectedPublicationType={props.selectedPublicationType}
          selectedPhotoType={props.selectedPhotoType}
          selectedNetworks={props.selectedNetworks}
          setSelectedNetworks={props.setSelectedNetworks}
          isSubmitting={props.isPublishing}
          onSubmit={props.handlePublishWrapper}
          hasRequiredInfo={true}
          generatedText={props.generatedText}
          setGeneratedText={props.setGeneratedText}
          images={listing?.images || []}
          selectedImages={props.selectedImages}
          setSelectedImages={props.setSelectedImages}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          selectedMusic={props.selectedMusic}
          listing={listing}
        />
      );
    default:
      return null;
  }
};

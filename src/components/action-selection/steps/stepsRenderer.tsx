
import { PublicationStep } from "./PublicationStep";
import { TemplateStep } from "./TemplateStep";
import { MediaStep } from "./MediaStep";
import { MediaGenerationStep } from "../media-generation/MediaGenerationStep";
import { SocialStep } from "./SocialStep";

export const renderStepContent = (props: any) => {
  const { currentStep, listing } = props;
  
  switch (currentStep) {
    case 1:
      return (
        <PublicationStep
          selectedPublicationTypes={props.selectedPublicationTypes}
          onPublicationTypeChange={props.handlePublicationTypeChange}
        />
      );
    case 2:
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
    case 3:
      return (
        <MediaStep
          selectedPublicationTypes={props.selectedPublicationTypes}
          images={listing?.images || []}
          selectedImages={props.selectedImages}
          bannerImage={props.bannerImage}
          bannerType={props.bannerType}
          musicList={props.musicList}
          selectedMusic={props.selectedMusic}
          currentlyPlaying={props.currentlyPlaying}
          toggleImageSelection={props.toggleImageSelection}
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
        />
      );
    case 4:
      return (
        <MediaGenerationStep
          selectedPublicationTypes={props.selectedPublicationTypes}
          selectedImages={props.selectedImages}
          isGeneratingSlideshow={props.isGeneratingSlideshow}
          isGeneratingBanner={props.isGeneratingBanner}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          slideshowError={props.slideshowError}
          bannerError={props.bannerError}
          slideshowRenderId={props.slideshowRenderId}
          bannerRenderId={props.bannerRenderId}
          formErrors={props.formErrors}
          generateSlideshow={props.generateSlideshowWrapper}
          generateBanner={props.generateBannerWrapper}
          refetchSlideshowStatus={props.refetchSlideshowStatus}
          bannerImage={props.bannerImage}
          bannerType={props.bannerType}
          setBannerType={props.setBannerType}
          selectBannerImage={props.selectBannerImage}
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
          setFormErrors={props.setFormErrors}
          onRegenerateSlideshow={props.handleRegenerateSlideshow}
          onRegenerateBanner={props.handleRegenerateBanner}
          selectedMusic={props.selectedMusic}
          toggleImageSelection={props.toggleImageSelection}
          listing={listing}
        />
      );
    case 5:
      return (
        <SocialStep
          selectedPublicationTypes={props.selectedPublicationTypes}
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

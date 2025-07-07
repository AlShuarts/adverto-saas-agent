
import { PublicationStep } from "./PublicationStep";
import { PhotoTypeStep } from "./PhotoTypeStep";
import { TemplateStep } from "./TemplateStep";
import { MediaStep } from "./MediaStep";
import { GenerationStep } from "./GenerationStep";
import { SocialStep } from "./SocialStep";
import { DialogContentProps } from "../dialog/types";

export const renderStepContent = (props: DialogContentProps) => {
  const { currentStep } = props;
  
  switch (currentStep) {
    case 1:
      return (
        <PublicationStep
          selectedPublicationType={props.selectedPublicationType}
          onPublicationTypeChange={props.handlePublicationTypeChange}
          onAutoNext={props.nextStep}
        />
      );
    case 2:
      return (
        <PhotoTypeStep
          selectedPhotoType={props.selectedPhotoType}
          onPhotoTypeChange={props.handlePhotoTypeChange}
          onAutoNext={props.nextStep}
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
          images={props.listing?.images || []}
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
          listing={props.listing}
          isGeneratingSlideshow={props.isGeneratingSlideshow}
          isGeneratingBanner={props.isGeneratingBanner}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          slideshowError={props.slideshowError}
          bannerError={props.bannerError}
          slideshowRenderId={props.slideshowRenderId}
          bannerRenderId={props.bannerRenderId}
          generateSlideshow={props.generateSlideshow}
          generateBanner={props.generateBanner}
          refetchSlideshowStatus={props.refetchSlideshowStatus}
          handleRegenerateSlideshow={props.handleRegenerateSlideshow}
          handleRegenerateBanner={props.handleRegenerateBanner}
        />
      );
    case 5:
      return (
        <GenerationStep
          selectedPublicationType={props.selectedPublicationType}
          selectedPhotoType={props.selectedPhotoType}
          selectedImages={props.selectedImages}
          bannerImage={props.bannerImage}
          bannerType={props.bannerType}
          setBannerType={props.setBannerType}
          selectBannerImage={props.selectBannerImage}
          selectedMusic={props.selectedMusic}
          generateSlideshow={props.generateSlideshow}
          generateBanner={props.generateBanner}
          isGeneratingSlideshow={props.isGeneratingSlideshow}
          isGeneratingBanner={props.isGeneratingBanner}
          slideshowRenderId={props.slideshowRenderId}
          bannerRenderId={props.bannerRenderId}
          slideshowError={props.slideshowError}
          bannerError={props.bannerError}
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
          onRegenerateSlideshow={props.handleRegenerateSlideshow}
          onRegenerateBanner={props.handleRegenerateBanner}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          refetchSlideshowStatus={props.refetchSlideshowStatus}
          toggleImageSelection={props.toggleImageSelection}
          listing={props.listing}
          handleMusicChange={props.handleMusicChange}
          previewMusic={props.previewMusic}
          currentlyPlaying={props.currentlyPlaying}
          musicList={props.musicList}
          onDragEnd={props.onDragEnd}
        />
      );
    case 6:
      return (
        <SocialStep
          selectedPublicationType={props.selectedPublicationType}
          selectedPhotoType={props.selectedPhotoType}
          selectedNetworks={props.selectedNetworks}
          setSelectedNetworks={props.setSelectedNetworks}
          isSubmitting={props.isPublishing}
          onSubmit={props.handlePublish}
          hasRequiredInfo={
            (props.selectedNetworks.facebook || props.selectedNetworks.instagram) &&
            (!!props.slideshowUrl || !!props.bannerUrl || props.selectedImages.length > 0)
          }
          generatedText={props.generatedText}
          setGeneratedText={props.setGeneratedText}
          images={props.listing?.images || []}
          selectedImages={props.selectedImages}
          setSelectedImages={props.setSelectedImages}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          selectedMusic={props.selectedMusic}
          listing={props.listing}
        />
      );
    default:
      return null;
  }
};


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
          selectedPublicationType={props.selectedPublicationType}
          facebookTemplates={props.facebookTemplates}
          instagramTemplates={props.instagramTemplates}
          selectedFacebookTemplateId={props.selectedFacebookTemplateId}
          selectedInstagramTemplateId={props.selectedInstagramTemplateId}
          setSelectedFacebookTemplateId={props.setSelectedFacebookTemplateId}
          setSelectedInstagramTemplateId={props.setSelectedInstagramTemplateId}
          generatedText={props.generatedText}
          setGeneratedText={props.setGeneratedText}
          isGeneratingText={props.isGeneratingText}
          handleGenerateText={props.handleGenerateText}
          listing={props.listing}
        />
      );
    case 4:
      return (
        <MediaStep
          selectedPhotoType={props.selectedPhotoType}
          selectedImages={props.selectedImages}
          setSelectedImages={props.setSelectedImages}
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
          selectAllImages={props.selectAllImages}
          deselectAllImages={props.deselectAllImages}
          listing={props.listing}
        />
      );
    case 5:
      return (
        <GenerationStep
          selectedPhotoType={props.selectedPhotoType}
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
    case 6:
      return (
        <SocialStep
          selectedNetworks={props.selectedNetworks}
          setSelectedNetworks={props.setSelectedNetworks}
          handleNetworkChange={props.handleNetworkChange}
          isPublishing={props.isPublishing}
          handlePublish={props.handlePublish}
        />
      );
    default:
      return null;
  }
};

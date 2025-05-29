
import { PublicationStep } from "../steps/PublicationStep";
import { PhotoTypeStep } from "../steps/PhotoTypeStep";
import { TemplateStep } from "../steps/TemplateStep";
import { MediaStep } from "../steps/MediaStep";
import { SocialStep } from "../steps/SocialStep";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogContentProps } from "./types";

export const ActionSelectionSteps = ({
  currentStep,
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
  generatedText,
  setGeneratedText,
  isGeneratingText,
  handleGenerateText,
  listing,
  selectedImages,
  setSelectedImages,
  bannerImage,
  bannerType,
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
  generateSlideshow,
  generateBanner,
  refetchSlideshowStatus,
  handleRegenerateSlideshow,
  handleRegenerateBanner,
  selectedNetworks,
  setSelectedNetworks,
  isPublishing,
  handlePublish,
  selectAllImages,
  deselectAllImages
}: DialogContentProps) => {

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PublicationStep
            selectedPublicationType={selectedPublicationType}
            onPublicationTypeChange={handlePublicationTypeChange}
          />
        );
      case 2:
        return (
          <PhotoTypeStep
            selectedPhotoType={selectedPhotoType}
            onPhotoTypeChange={handlePhotoTypeChange}
          />
        );
      case 3:
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
      case 4:
        return (
          <MediaStep
            selectedPublicationType={selectedPublicationType}
            selectedPhotoType={selectedPhotoType}
            images={listing?.images || []}
            selectedImages={selectedImages}
            bannerImage={bannerImage}
            bannerType={bannerType}
            musicList={[]}
            selectedMusic={selectedMusic}
            currentlyPlaying={currentlyPlaying}
            toggleImageSelection={toggleImageSelection}
            selectAllImages={selectAllImages}
            deselectAllImages={deselectAllImages}
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
            listing={listing}
            isGeneratingSlideshow={isGeneratingSlideshow}
            isGeneratingBanner={isGeneratingBanner}
            slideshowUrl={slideshowUrl}
            bannerUrl={bannerUrl}
            slideshowError={slideshowError}
            bannerError={bannerError}
            slideshowRenderId={slideshowRenderId}
            bannerRenderId={bannerRenderId}
            generateSlideshow={generateSlideshow}
            generateBanner={generateBanner}
            refetchSlideshowStatus={refetchSlideshowStatus}
            handleRegenerateSlideshow={handleRegenerateSlideshow}
            handleRegenerateBanner={handleRegenerateBanner}
          />
        );
      case 5:
        return (
          <SocialStep
            selectedPublicationType={selectedPublicationType}
            selectedPhotoType={selectedPhotoType}
            selectedNetworks={selectedNetworks}
            setSelectedNetworks={setSelectedNetworks}
            isSubmitting={isPublishing}
            onSubmit={handlePublish}
            hasRequiredInfo={!!generatedText}
            generatedText={generatedText}
            setGeneratedText={setGeneratedText}
            images={listing?.images || []}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            slideshowUrl={slideshowUrl}
            bannerUrl={bannerUrl}
            selectedMusic={selectedMusic}
            listing={listing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="max-h-[calc(85vh-10rem)]">
      <div className="my-4 pr-4 pb-4">
        {renderContent()}
      </div>
    </ScrollArea>
  );
};


import { PublicationStep } from "../steps/PublicationStep";
import { TemplateStep } from "../steps/TemplateStep";
import { GenerationStep } from "../steps/GenerationStep";
import { SocialStep } from "../steps/SocialStep";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Instagram, Facebook } from "lucide-react";
import { FacebookPreviewContent } from "../../FacebookPreviewContent";
import { InstagramPreviewContent } from "../../InstagramPreviewContent";
import { supabase } from "@/integrations/supabase/client";
import { DialogContentProps } from "./types";

export const ActionSelectionSteps = ({
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
  generateSlideshow,
  generateBanner,
  refetchSlideshowStatus,
  handleRegenerateSlideshow,
  handleRegenerateBanner,
  selectedNetworks,
  setSelectedNetworks,
  isPublishing,
  handlePublish
}: DialogContentProps) => {

  const renderContent = () => {
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
          <GenerationStep
            selectedPublicationTypes={selectedPublicationTypes}
            selectedImages={selectedImages}
            bannerImage={bannerImage}
            bannerType={bannerType}
            setBannerType={setBannerType}
            selectBannerImage={selectBannerImage}
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
            generateSlideshow={generateSlideshow}
            generateBanner={generateBanner}
            isGeneratingSlideshow={isGeneratingSlideshow}
            isGeneratingBanner={isGeneratingBanner}
            slideshowRenderId={slideshowRenderId}
            slideshowError={slideshowError}
            bannerError={bannerError}
            slideshowUrl={slideshowUrl}
            bannerUrl={bannerUrl}
            refetchSlideshowStatus={refetchSlideshowStatus}
            onRegenerateSlideshow={handleRegenerateSlideshow}
            onRegenerateBanner={handleRegenerateBanner}
            selectedMusic={selectedMusic}
            toggleImageSelection={toggleImageSelection}
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
    <ScrollArea className="max-h-[calc(85vh-10rem)]">
      <div className="my-4 pr-4 pb-4">
        {renderContent()}
      </div>
    </ScrollArea>
  );
};

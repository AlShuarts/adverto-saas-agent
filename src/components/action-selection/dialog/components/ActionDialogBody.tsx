
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderStepContent } from "../../steps/stepsRenderer";
import { useIsMobile } from "@/hooks/use-mobile";
import { DialogContentProps } from "../types";

type ActionDialogBodyProps = Pick<DialogContentProps, 
  | "currentStep"
  | "selectedPublicationType"
  | "selectedPhotoType"
  | "handlePublicationTypeChange"
  | "handlePhotoTypeChange"
  | "facebookTemplates"
  | "instagramTemplates"
  | "selectedFacebookTemplateId"
  | "selectedInstagramTemplateId"
  | "setSelectedFacebookTemplateId"
  | "setSelectedInstagramTemplateId"
  | "generatedText"
  | "setGeneratedText"
  | "isGeneratingText"
  | "handleGenerateText"
  | "listing"
  | "selectedImages"
  | "setSelectedImages"
  | "bannerImage"
  | "bannerType"
  | "musicList"
  | "selectedMusic"
  | "currentlyPlaying"
  | "toggleImageSelection"
  | "onDragEnd"
  | "selectBannerImage"
  | "handleMusicChange"
  | "previewMusic"
  | "setBannerType"
  | "brokerImageUrl"
  | "setBrokerImageUrl"
  | "agencyLogoUrl"
  | "setAgencyLogoUrl"
  | "brokerName"
  | "setBrokerName"
  | "brokerEmail"
  | "setBrokerEmail"
  | "brokerPhone"
  | "setBrokerPhone"
  | "formErrors"
  | "setFormErrors"
  | "selectAllImages"
  | "deselectAllImages"
  | "isGeneratingSlideshow"
  | "isGeneratingBanner"
  | "slideshowUrl"
  | "bannerUrl"
  | "slideshowError"
  | "bannerError"
  | "slideshowRenderId"
  | "bannerRenderId"
  | "generateSlideshow"
  | "generateBanner"
  | "refetchSlideshowStatus"
  | "handleRegenerateSlideshow"
  | "handleRegenerateBanner"
  | "selectedNetworks"
  | "setSelectedNetworks"
  | "handleNetworkChange"
  | "isPublishing"
  | "handlePublish"
>;

export const ActionDialogBody = (props: ActionDialogBodyProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex-1 overflow-hidden min-h-0">
      <ScrollArea className={isMobile ? "h-[calc(95vh-12rem)]" : "h-[calc(90vh-12rem)]"}>
        <div className={`${isMobile ? "p-2" : "p-4"} pb-6`}>
          {renderStepContent(props)}
        </div>
      </ScrollArea>
    </div>
  );
};


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
  | "nextStep"
>;

export const ActionDialogBody = (props: ActionDialogBodyProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex-1 overflow-hidden min-h-0">
      <ScrollArea className={isMobile ? "h-[calc(95vh-10rem)]" : "h-[calc(90vh-10rem)]"}>
        <div className={`${isMobile ? "px-2 py-1" : "px-3 py-2"}`}>
          {renderStepContent({...props, nextStep: props.nextStep})}
        </div>
      </ScrollArea>
    </div>
  );
};

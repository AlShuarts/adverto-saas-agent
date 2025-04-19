
import { PublicationStep } from "./PublicationStep";
import { TemplateStep } from "./TemplateStep";
import { GenerationStep } from "./GenerationStep";
import { SocialStep } from "./SocialStep";
import { PublicationType } from "../types";

type StepRendererProps = {
  currentStep: number;
  selectedPublicationTypes: PublicationType[];
  handlePublicationTypeChange: (type: PublicationType, checked: boolean) => void;
  
  // Template step props
  facebookTemplates: any[];
  instagramTemplates: any[];
  selectedFacebookTemplateId: string | null;
  selectedInstagramTemplateId: string | null;
  setSelectedFacebookTemplateId: (id: string) => void;
  setSelectedInstagramTemplateId: (id: string) => void;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  isGeneratingText: boolean;
  handleGenerateText: () => Promise<void>;
  
  // Media step props
  listing: any;
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  musicList: any[];
  selectedMusic: string | undefined;
  currentlyPlaying: string | null;
  toggleImageSelection: (imageUrl: string) => void;
  onDragEnd: (result: any) => void;
  selectBannerImage: (imageUrl: string) => void;
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  
  // Generation step props
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  generateSlideshowWrapper: () => Promise<string | null>;
  generateBannerWrapper: () => Promise<void>;
  refetchSlideshowStatus: () => void;
  handleRegenerateSlideshow: () => void;
  handleRegenerateBanner: () => void;
  
  // Social step props
  selectedNetworks: {facebook: boolean; instagram: boolean;};
  setSelectedNetworks: (networks: {facebook: boolean; instagram: boolean;}) => void;
  handleNetworkChange: (network: "facebook" | "instagram", checked: boolean) => void;
  isPublishing: boolean;
  handlePublishWrapper: () => Promise<void>;
};

export const renderStepContent = (props: StepRendererProps) => {
  switch (props.currentStep) {
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
        <GenerationStep
          selectedPublicationTypes={props.selectedPublicationTypes}
          selectedImages={props.selectedImages}
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
          formErrors={props.formErrors}
          setFormErrors={props.setFormErrors}
          generateSlideshow={props.generateSlideshowWrapper}
          generateBanner={props.generateBannerWrapper}
          isGeneratingSlideshow={props.isGeneratingSlideshow}
          isGeneratingBanner={props.isGeneratingBanner}
          slideshowRenderId={props.slideshowRenderId}
          slideshowError={props.slideshowError}
          bannerError={props.bannerError}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          refetchSlideshowStatus={props.refetchSlideshowStatus}
          onRegenerateSlideshow={props.handleRegenerateSlideshow}
          onRegenerateBanner={props.handleRegenerateBanner}
          selectedMusic={props.selectedMusic}
          toggleImageSelection={props.toggleImageSelection}
          listing={props.listing}
        />
      );
    
    case 4:
      return (
        <SocialStep
          selectedPublicationTypes={props.selectedPublicationTypes}
          selectedNetworks={props.selectedNetworks}
          setSelectedNetworks={props.setSelectedNetworks}
          isSubmitting={props.isPublishing}
          onSubmit={props.handlePublishWrapper}
          hasRequiredInfo={!!props.generatedText}
          generatedText={props.generatedText}
          setGeneratedText={props.setGeneratedText}
          images={props.listing.images || []}
          selectedImages={props.selectedImages}
          setSelectedImages={props.setSelectedImages}
          slideshowUrl={props.slideshowUrl}
          bannerUrl={props.bannerUrl}
          selectedMusic={props.selectedMusic}
        />
      );
    
    default:
      return null;
  }
};

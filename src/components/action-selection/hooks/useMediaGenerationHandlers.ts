
import { Tables } from "@/integrations/supabase/types";
import { BrokerInfo } from "./generation/services/bannerService";

export const useMediaGenerationHandlers = (
  listingId: string,
  selectedImages: string[],
  selectedMusic: string | undefined,
  slideshowRenderId: string | null,
  setSlideshowUrl: (url: string | null) => void,
  setIsGeneratingSlideshow: (isGenerating: boolean) => void,
  generateSlideshow: (images: string[], music: string | undefined) => Promise<string | null>,
  generateBanner: (bannerImage: string, bannerType: "VENDU" | "A_VENDRE", brokerInfo: BrokerInfo) => Promise<{ success?: boolean; errors?: Record<string, string> }>,
) => {
  const handleGenerateSlideshow = async (): Promise<string | null> => {
    console.log("Generating slideshow with music:", selectedMusic || "aucune musique");
    return await generateSlideshow(selectedImages, selectedMusic);
  };
  
  const handleGenerateBanner = async (
    bannerImage: string | null,
    bannerType: "VENDU" | "A_VENDRE",
    brokerInfo: BrokerInfo,
    validateBrokerInfo: () => Record<string, string>,
    setFormErrors: (errors: Record<string, string>) => void,
  ): Promise<{ success?: boolean; errors?: Record<string, string> }> => {
    const errors = validateBrokerInfo();
    
    if (!bannerImage) {
      errors.bannerImage = "Veuillez sélectionner une image pour la bannière";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return { errors };
    }

    if (!bannerImage) {
      return { success: false };
    }

    return await generateBanner(bannerImage, bannerType, brokerInfo);
  };

  return {
    handleGenerateSlideshow,
    handleGenerateBanner,
  };
};

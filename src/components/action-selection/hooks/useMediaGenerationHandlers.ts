
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Make sure we add or modify this function to forward the selectedMusic parameter
export const useMediaGenerationHandlers = (
  listingId: string,
  selectedImages: string[],
  selectedMusic: string | undefined,  // Include selectedMusic as a parameter
  slideshowRenderId: string | null,
  setSlideshowUrl: (url: string | null) => void,
  setIsGeneratingSlideshow: (isGenerating: boolean) => void,
  generateSlideshow: (images: string[], music?: string) => Promise<string | null>,
  generateBanner: (bannerImage: string, bannerType: "VENDU" | "A_VENDRE", brokerInfo: any) => Promise<{ success?: boolean; error?: string }>
) => {
  const handleGenerateBanner = async (
    bannerImage: string | null,
    bannerType: "VENDU" | "A_VENDRE",
    brokerInfo: any,
    validateBrokerInfo: (brokerInfo: any) => { isValid: boolean; errors: Record<string, string> },
    setFormErrors: (errors: Record<string, string>) => void
  ): Promise<{ success?: boolean; errors?: Record<string, string> }> => {
    if (!bannerImage) {
      toast.error("Veuillez sélectionner une image pour la bannière.");
      return { success: false, errors: { "bannerImage": "Image manquante" } };
    }

    const validationResult = validateBrokerInfo(brokerInfo);
    if (!validationResult.isValid) {
      setFormErrors(validationResult.errors);
      toast.error("Veuillez vérifier les informations du courtier.");
      return { success: false, errors: validationResult.errors };
    }

    setFormErrors({}); // Clear any previous errors
    
    try {
      toast.info("Génération de la bannière", {
        description: "Nous préparons votre bannière...",
        duration: 3000
      });
      const result = await generateBanner(bannerImage, bannerType, brokerInfo);
      return { success: result.success };
    } catch (error) {
      console.error("Erreur lors de la génération de la bannière:", error);
      toast.error("Erreur lors de la génération de la bannière", {
        description: "Une erreur est survenue lors de la génération de la bannière.",
        duration: 5000
      });
      return { success: false, errors: { "general": "Erreur lors de la génération" } };
    }
  };

  // You don't need to add a handleGenerateSlideshow here since we're passing the selectedMusic 
  // directly to the generateSlideshow function in useMediaState

  return {
    handleGenerateBanner
  };
};

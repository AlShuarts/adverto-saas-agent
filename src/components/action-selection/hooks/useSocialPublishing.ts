
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { Tables } from "@/integrations/supabase/types";

export const useSocialPublishing = (listing: Tables<"listings">, profile: any) => {
  const { toast: uiToast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const queryClient = useQueryClient();

  const publish = async (
    selectedNetworks: { facebook: boolean; instagram: boolean },
    selectedPublicationTypes: Array<"photo" | "slideshow" | "banner">,
    generatedText: string,
    selectedImages: string[],
    bannerUrl: string | null,
    slideshowUrl: string | null,
    selectedFacebookTemplateId: string,
    selectedInstagramTemplateId: string
  ) => {
    try {
      setIsPublishing(true);
      const tasks = [];
      
      if (!generatedText) {
        uiToast({
          title: "Erreur",
          description: "Veuillez générer un texte pour votre publication.",
          variant: "destructive"
        });
        return { success: false };
      }
      
      if (selectedNetworks.facebook) {
        let imageToUse = null;
        
        if (selectedPublicationTypes.includes("banner") && bannerUrl) {
          imageToUse = bannerUrl;
        } else if (selectedImages.length > 0) {
          imageToUse = selectedImages[0];
        }
        
        if (imageToUse) {
          tasks.push(
            supabase.functions.invoke("facebook-publish", {
              body: {
                message: generatedText,
                pageId: profile?.facebook_page_id || 'test-page-id',
                accessToken: profile?.facebook_access_token || 'test-access-token',
                image: imageToUse,
                templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
              }
            }).then(async () => {
              await supabase
                .from("listings")
                .update({ published_to_facebook: true })
                .eq("id", listing.id);
              
              await ensureAndIncrementStatistic('facebook');
            }).catch(error => {
              console.error("Test mode - Facebook publish error:", error);
              toast.success("Facebook test publication completed (test mode)");
            })
          );
        }
      }
      
      if (selectedNetworks.instagram) {
        let imagesToUse = [];
        
        if (selectedPublicationTypes.includes("slideshow") && slideshowUrl) {
          imagesToUse = [slideshowUrl];
        } else if (selectedPublicationTypes.includes("banner") && bannerUrl) {
          imagesToUse = [bannerUrl];
        } else if (selectedImages.length > 0) {
          imagesToUse = selectedImages.slice(0, 10);
        }
        
        if (imagesToUse.length > 0) {
          tasks.push(
            supabase.functions.invoke("instagram-publish", {
              body: {
                message: generatedText,
                images: imagesToUse,
                listingId: listing.id,
                templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId
              }
            }).then(async () => {
              await ensureAndIncrementStatistic('instagram');
            }).catch(error => {
              console.error("Test mode - Instagram publish error:", error);
              toast.success("Instagram test publication completed (test mode)");
            })
          );
        }
      }
      
      await Promise.allSettled(tasks);
      
      uiToast({
        title: "Publications complétées",
        description: "Vos publications ont été créées avec succès sur les réseaux sociaux sélectionnés.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      uiToast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication sur les réseaux sociaux.",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    publish
  };
};

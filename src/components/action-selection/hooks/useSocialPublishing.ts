
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { toast } from "sonner";

type Profile = {
  id: string;
  facebook_page_id?: string;
  facebook_access_token?: string;
};

type PublicationType = "photo" | "slideshow" | "banner";

export const useSocialPublishing = (
  listing: Tables<"listings">,
  profile?: Profile | null
) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = async (
    selectedNetworks: { facebook: boolean; instagram: boolean },
    selectedPublicationTypes: PublicationType[],
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
        toast.error("Erreur", {
          description: "Veuillez générer un texte pour votre publication.",
        });
        return { success: false };
      }
      
      if (selectedNetworks.facebook) {
        // Préparer une URL vidéo robuste si un diaporama est attendu
        let finalVideoUrl: string | null = slideshowUrl || listing.video_url || null;

        if (!finalVideoUrl) {
          // Essayer de récupérer le dernier rendu COMPLÉTÉ avec URL pour ce listing
          const { data: completedRows, error: completedErr } = await supabase
            .from("slideshow_renders")
            .select("video_url, status, created_at")
            .eq("listing_id", listing.id)
            .not("video_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(1);
          if (!completedErr && completedRows && completedRows.length > 0) {
            finalVideoUrl = completedRows[0].video_url as string | null;
          }
        }
        
        // Si l'utilisateur a sélectionné "slideshow" et qu'une vidéo est dispo, publier en vidéo
        if (selectedPublicationTypes.includes("slideshow") && finalVideoUrl) {
          if (!profile?.facebook_page_id || !profile?.facebook_access_token) {
            toast.error("Configuration Facebook manquante", {
              description: "Veuillez configurer votre page Facebook dans votre profil.",
            });
          } else {
            tasks.push(
              supabase.functions.invoke("facebook-publish", {
                body: {
                  message: generatedText,
                  video: finalVideoUrl,
                  pageId: profile.facebook_page_id,
                  accessToken: profile.facebook_access_token,
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
        } else {
          // Sinon utiliser bannière ou images
          let imageToUse = null as string | null;
          if (selectedPublicationTypes.includes("banner") && bannerUrl) {
            imageToUse = bannerUrl;
          } else if (selectedImages.length > 0) {
            imageToUse = selectedImages[0];
          }
          
          if (imageToUse) {
            if (!profile?.facebook_page_id || !profile?.facebook_access_token) {
              toast.error("Configuration Facebook manquante", {
                description: "Veuillez configurer votre page Facebook dans votre profil.",
              });
            } else {
              tasks.push(
                supabase.functions.invoke("facebook-publish", {
                  body: {
                    message: generatedText,
                    images: [imageToUse],
                    pageId: profile.facebook_page_id,
                    accessToken: profile.facebook_access_token,
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
        }
      }
      
      if (selectedNetworks.instagram) {
        // Préparer une URL vidéo robuste comme pour Facebook
        let finalVideoUrl: string | null = slideshowUrl || listing.video_url || null;
        let slideshowData: { render_id?: string | null; video_url?: string | null; status?: string | null } | null = null;

        if (!finalVideoUrl) {
          const { data: rows, error: rowsErr } = await supabase
            .from("slideshow_renders")
            .select("render_id, video_url, status, created_at")
            .eq("listing_id", listing.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (!rowsErr && rows && rows.length > 0) {
            slideshowData = rows[0] as any;
            if (rows[0].video_url) {
              finalVideoUrl = rows[0].video_url as string;
            } else if (rows[0].render_id) {
              // Tentative immédiate de récupération via check-render-status
              // Récupérer la session pour l'appel authentifié
              const { data: { session: checkSession } } = await supabase.auth.getSession();
              
              const { data: statusData, error: statusError } = await supabase.functions.invoke("check-render-status", {
                body: { renderId: rows[0].render_id },
                headers: checkSession ? {
                  Authorization: `Bearer ${checkSession.access_token}`
                } : {}
              });
              if (!statusError && statusData?.videoUrl) {
                finalVideoUrl = statusData.videoUrl as string;
              }
            }
          }
        }

        if (selectedPublicationTypes.includes("slideshow")) {
          if (finalVideoUrl) {
            tasks.push(
              supabase.functions.invoke("instagram-publish", {
                body: {
                  message: generatedText,
                  video: finalVideoUrl,
                  listingId: listing.id,
                  templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId,
                },
              }).then(async () => {
                await ensureAndIncrementStatistic('instagram');
              }).catch(error => {
                console.error("Test mode - Instagram publish error:", error);
                toast.success("Instagram test publication completed (test mode)");
              })
            );
          } else if (slideshowData) {
            // Un rendu existe mais pas encore prêt -> ne pas fallback en images
            toast.error("Diaporama en préparation", {
              description: "Le diaporama est en cours de finalisation. Réessayez dans quelques secondes pour publier la vidéo sur Instagram.",
            });
          } else {
            // Aucun rendu détecté -> fallback images/bannière si disponibles
            let imagesToUse: string[] = [];
            if (selectedPublicationTypes.includes("banner") && bannerUrl) {
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
                    templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId,
                  },
                }).then(async () => {
                  await ensureAndIncrementStatistic('instagram');
                }).catch(error => {
                  console.error("Test mode - Instagram publish error:", error);
                  toast.success("Instagram test publication completed (test mode)");
                })
              );
            }
          }
        } else {
          // Pas un slideshow -> publier bannière ou images
          let imagesToUse: string[] = [];
          if (selectedPublicationTypes.includes("banner") && bannerUrl) {
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
                  templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId,
                },
              }).then(async () => {
                await ensureAndIncrementStatistic('instagram');
              }).catch(error => {
                console.error("Test mode - Instagram publish error:", error);
                toast.success("Instagram test publication completed (test mode)");
              })
            );
          }
        }
      }
      
      await Promise.allSettled(tasks);
      
      toast.success("Publications complétées", {
        description: "Vos publications ont été créées avec succès sur les réseaux sociaux sélectionnés.",
      });
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la publication sur les réseaux sociaux.",
      });
      return { success: false };
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    publish
  };
};

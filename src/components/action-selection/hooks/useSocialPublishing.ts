
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
    selectedFacebookImages: string[],
    selectedInstagramImages: string[],
    bannerUrl: string | null,
    slideshowUrl: string | null,
    selectedFacebookTemplateId: string,
    selectedInstagramTemplateId: string
  ) => {
    try {
      setIsPublishing(true);
      
      // Get session once at the beginning for all API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée", {
          description: "Veuillez vous reconnecter.",
        });
        return { success: false };
      }
      
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
          // Get session for Authorization header
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            toast.error("Session expirée", {
              description: "Veuillez vous reconnecter.",
            });
          } else {
            // Basic check - server will fetch credentials
            const { data: fbCreds, error: fbError } = await supabase
              .rpc('get_facebook_credentials', { _user_id: session.user.id });

            if (fbError || !fbCreds || fbCreds.length === 0 || !fbCreds[0].page_id) {
              toast.error("Configuration Facebook manquante", {
                description: "Veuillez configurer votre page Facebook dans votre profil.",
              });
            } else {
              tasks.push(
                supabase.functions.invoke("facebook-publish", {
                  body: {
                    message: generatedText,
                    video: finalVideoUrl,
                    templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
                  },
                  headers: {
                    Authorization: `Bearer ${session.access_token}`
                  }
                }).then(async () => {
                const { error: updateError } = await supabase
                  .from("listings")
                  .update({ published_to_facebook: true })
                  .eq("id", listing.id);
                
                if (updateError) {
                  console.error("Error updating listing:", updateError);
                }
                
                toast.success("Facebook test publication completed (test mode)");
              })
            );
            }
          }
        } else {
          // Sinon utiliser bannière ou images Facebook
          let imagesToUse: string[] = [];
          if (selectedPublicationTypes.includes("banner") && bannerUrl) {
            imagesToUse = [bannerUrl];
          } else if (selectedFacebookImages.length > 0) {
            imagesToUse = selectedFacebookImages;
          }
          
          if (imagesToUse.length > 0) {
            // Get session for Authorization header
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
              toast.error("Session expirée", {
                description: "Veuillez vous reconnecter.",
              });
            } else {
              // Basic check - server will fetch credentials
              const { data: fbCreds, error: fbError } = await supabase
                .rpc('get_facebook_credentials', { _user_id: session.user.id });

              if (fbError || !fbCreds || fbCreds.length === 0 || !fbCreds[0].page_id) {
                toast.error("Configuration Facebook manquante", {
                  description: "Veuillez configurer votre page Facebook dans votre profil.",
                });
              } else {
                tasks.push(
                  supabase.functions.invoke("facebook-publish", {
                    body: {
                      message: generatedText,
                      images: imagesToUse,
                      templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
                    },
                    headers: {
                      Authorization: `Bearer ${session.access_token}`
                    }
                  }).then(async () => {
                  const { error: updateError } = await supabase
                    .from("listings")
                    .update({ published_to_facebook: true })
                    .eq("id", listing.id);
                  
                  if (updateError) {
                    console.error("Error updating listing:", updateError);
                  }
                  
                  toast.success("Facebook test publication completed (test mode)");
                })
              );
              }
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
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                }
              }).then(async (response) => {
                if (response.error) {
                  throw new Error(response.error.message || "Échec de la publication Instagram");
                }
                await ensureAndIncrementStatistic('instagram');
                toast.success("Publié sur Instagram", {
                  description: "Votre diaporama a été publié avec succès.",
                });
              }).catch(error => {
                console.error("Instagram publish error:", error);
                toast.error("Erreur Instagram", {
                  description: error?.message || "Échec de la publication sur Instagram",
                });
              })
            );
          } else if (slideshowData) {
            // Un rendu existe mais pas encore prêt -> ne pas fallback en images
            toast.error("Diaporama en préparation", {
              description: "Le diaporama est en cours de finalisation. Réessayez dans quelques secondes pour publier la vidéo sur Instagram.",
            });
          } else {
            // Aucun rendu détecté -> fallback images/bannière Instagram si disponibles
            let imagesToUse: string[] = [];
            if (selectedPublicationTypes.includes("banner") && bannerUrl) {
              imagesToUse = [bannerUrl];
            } else if (selectedInstagramImages.length > 0) {
              imagesToUse = selectedInstagramImages.slice(0, 10);
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
                  headers: {
                    Authorization: `Bearer ${session.access_token}`
                  }
              }).then(async (response) => {
                if (response.error) {
                  throw new Error(response.error.message || "Échec de la publication Instagram");
                }
                await ensureAndIncrementStatistic('instagram');
                toast.success("Publié sur Instagram", {
                  description: "Votre publication a été créée avec succès.",
                });
              }).catch(error => {
                console.error("Instagram publish error:", error);
                toast.error("Erreur Instagram", {
                  description: error?.message || "Échec de la publication sur Instagram",
                });
              })
            );
          } else {
            toast.warning("Instagram", {
              description: "Aucune image sélectionnée pour Instagram. Veuillez sélectionner au moins une image.",
            });
          }
        }
      } else {
          // Pas un slideshow -> publier bannière ou images Instagram
          let imagesToUse: string[] = [];
          if (selectedPublicationTypes.includes("banner") && bannerUrl) {
            imagesToUse = [bannerUrl];
          } else if (selectedInstagramImages.length > 0) {
            imagesToUse = selectedInstagramImages.slice(0, 10);
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
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                }
              }).then(async (response) => {
                if (response.error) {
                  throw new Error(response.error.message || "Échec de la publication Instagram");
                }
                await ensureAndIncrementStatistic('instagram');
                toast.success("Publié sur Instagram", {
                  description: "Votre publication a été créée avec succès.",
                });
              }).catch(error => {
                console.error("Instagram publish error:", error);
                toast.error("Erreur Instagram", {
                  description: error?.message || "Échec de la publication sur Instagram",
                });
              })
            );
          } else {
            toast.warning("Instagram", {
              description: "Aucune image sélectionnée pour Instagram. Veuillez sélectionner au moins une image.",
            });
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

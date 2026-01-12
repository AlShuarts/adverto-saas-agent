
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

type PublishResult = {
  network: "facebook" | "instagram";
  success: boolean;
  error?: string;
  retryAfterSeconds?: number;
};

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
      
      const tasks: Promise<PublishResult>[] = [];
      
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
          // Basic check - server will fetch credentials
          const { data: fbCreds, error: fbError } = await supabase
            .rpc('get_facebook_credentials', { _user_id: session.user.id });

          if (fbError || !fbCreds || fbCreds.length === 0 || !fbCreds[0].page_id) {
            toast.error("Configuration Facebook manquante", {
              description: "Veuillez configurer votre page Facebook dans votre profil.",
            });
          } else {
            tasks.push(
              (async (): Promise<PublishResult> => {
                try {
                  const response = await supabase.functions.invoke("facebook-publish", {
                    body: {
                      message: generatedText,
                      video: finalVideoUrl,
                      templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
                    },
                    headers: {
                      Authorization: `Bearer ${session.access_token}`
                    }
                  });
                  
                  if (response.error) {
                    return { network: "facebook", success: false, error: response.error.message };
                  }
                  
                  // Check response data for errors
                  if (response.data?.error) {
                    return { network: "facebook", success: false, error: response.data.error };
                  }
                  
                  await supabase
                    .from("listings")
                    .update({ published_to_facebook: true })
                    .eq("id", listing.id);
                  
                  return { network: "facebook", success: true };
                } catch (error: any) {
                  return { network: "facebook", success: false, error: error?.message || "Erreur inconnue" };
                }
              })()
            );
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
            // Basic check - server will fetch credentials
            const { data: fbCreds, error: fbError } = await supabase
              .rpc('get_facebook_credentials', { _user_id: session.user.id });

            if (fbError || !fbCreds || fbCreds.length === 0 || !fbCreds[0].page_id) {
              toast.error("Configuration Facebook manquante", {
                description: "Veuillez configurer votre page Facebook dans votre profil.",
              });
            } else {
              tasks.push(
                (async (): Promise<PublishResult> => {
                  try {
                    const response = await supabase.functions.invoke("facebook-publish", {
                      body: {
                        message: generatedText,
                        images: imagesToUse,
                        templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
                      },
                      headers: {
                        Authorization: `Bearer ${session.access_token}`
                      }
                    });
                    
                    if (response.error) {
                      return { network: "facebook", success: false, error: response.error.message };
                    }
                    
                    if (response.data?.error) {
                      return { network: "facebook", success: false, error: response.data.error };
                    }
                    
                    await supabase
                      .from("listings")
                      .update({ published_to_facebook: true })
                      .eq("id", listing.id);
                    
                    return { network: "facebook", success: true };
                  } catch (error: any) {
                    return { network: "facebook", success: false, error: error?.message || "Erreur inconnue" };
                  }
                })()
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
              const { data: statusData, error: statusError } = await supabase.functions.invoke("check-render-status", {
                body: { renderId: rows[0].render_id },
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                }
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
              (async (): Promise<PublishResult> => {
                try {
                  const response = await supabase.functions.invoke("instagram-publish", {
                    body: {
                      message: generatedText,
                      video: finalVideoUrl,
                      listingId: listing.id,
                      templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId,
                    },
                    headers: {
                      Authorization: `Bearer ${session.access_token}`
                    }
                  });
                  
                  if (response.error) {
                    return { network: "instagram", success: false, error: response.error.message };
                  }
                  
                  // Check for structured error response
                  if (response.data?.error === 'MEDIA_NOT_READY') {
                    return { 
                      network: "instagram", 
                      success: false, 
                      error: response.data.message || "Le média est en cours de traitement",
                      retryAfterSeconds: response.data.retryAfterSeconds || 30
                    };
                  }
                  
                  if (response.data?.success === false) {
                    return { network: "instagram", success: false, error: response.data.message || response.data.error };
                  }
                  
                  await ensureAndIncrementStatistic('instagram');
                  return { network: "instagram", success: true };
                } catch (error: any) {
                  return { network: "instagram", success: false, error: error?.message || "Erreur inconnue" };
                }
              })()
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
                (async (): Promise<PublishResult> => {
                  try {
                    const response = await supabase.functions.invoke("instagram-publish", {
                      body: {
                        message: generatedText,
                        images: imagesToUse,
                        listingId: listing.id,
                        templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId,
                      },
                      headers: {
                        Authorization: `Bearer ${session.access_token}`
                      }
                    });
                    
                    if (response.error) {
                      return { network: "instagram", success: false, error: response.error.message };
                    }
                    
                    if (response.data?.error === 'MEDIA_NOT_READY') {
                      return { 
                        network: "instagram", 
                        success: false, 
                        error: response.data.message || "Le média est en cours de traitement",
                        retryAfterSeconds: response.data.retryAfterSeconds || 30
                      };
                    }
                    
                    if (response.data?.success === false) {
                      return { network: "instagram", success: false, error: response.data.message || response.data.error };
                    }
                    
                    await ensureAndIncrementStatistic('instagram');
                    return { network: "instagram", success: true };
                  } catch (error: any) {
                    return { network: "instagram", success: false, error: error?.message || "Erreur inconnue" };
                  }
                })()
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
              (async (): Promise<PublishResult> => {
                try {
                  const response = await supabase.functions.invoke("instagram-publish", {
                    body: {
                      message: generatedText,
                      images: imagesToUse,
                      listingId: listing.id,
                      templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId,
                    },
                    headers: {
                      Authorization: `Bearer ${session.access_token}`
                    }
                  });
                  
                  if (response.error) {
                    return { network: "instagram", success: false, error: response.error.message };
                  }
                  
                  if (response.data?.error === 'MEDIA_NOT_READY') {
                    return { 
                      network: "instagram", 
                      success: false, 
                      error: response.data.message || "Le média est en cours de traitement",
                      retryAfterSeconds: response.data.retryAfterSeconds || 30
                    };
                  }
                  
                  if (response.data?.success === false) {
                    return { network: "instagram", success: false, error: response.data.message || response.data.error };
                  }
                  
                  await ensureAndIncrementStatistic('instagram');
                  return { network: "instagram", success: true };
                } catch (error: any) {
                  return { network: "instagram", success: false, error: error?.message || "Erreur inconnue" };
                }
              })()
            );
          } else {
            toast.warning("Instagram", {
              description: "Aucune image sélectionnée pour Instagram. Veuillez sélectionner au moins une image.",
            });
          }
        }
      }
      
      // Wait for all tasks and collect results
      const results = await Promise.all(tasks);
      
      // Analyze results
      const facebookResult = results.find(r => r.network === "facebook");
      const instagramResult = results.find(r => r.network === "instagram");
      
      let hasSuccess = false;
      let hasError = false;
      
      // Build recap parts
      const successParts: string[] = [];
      const errorParts: string[] = [];
      
      // Handle Facebook result
      if (facebookResult) {
        if (facebookResult.success) {
          hasSuccess = true;
          successParts.push("Facebook");
        } else {
          hasError = true;
          errorParts.push(`Facebook: ${facebookResult.error || "Échec"}`);
        }
      }
      
      // Handle Instagram result
      if (instagramResult) {
        if (instagramResult.success) {
          hasSuccess = true;
          successParts.push("Instagram");
        } else {
          hasError = true;
          if (instagramResult.retryAfterSeconds) {
            errorParts.push(`Instagram: En traitement, réessayez dans ${instagramResult.retryAfterSeconds}s`);
          } else {
            errorParts.push(`Instagram: ${instagramResult.error || "Échec"}`);
          }
        }
      }
      
      // Show a single consolidated toast
      if (hasSuccess && !hasError) {
        // All succeeded
        toast.success("✓ Publications réussies", {
          description: `Publié sur ${successParts.join(" et ")} avec succès !`,
          duration: 10000,
        });
      } else if (hasSuccess && hasError) {
        // Partial success
        toast.warning("Publication partielle", {
          description: `✓ ${successParts.join(", ")} publié | ✗ ${errorParts.join(" | ")}`,
          duration: 12000,
        });
      } else if (hasError) {
        // All failed
        toast.error("Échec de publication", {
          description: errorParts.join(" | "),
          duration: 15000,
        });
      }
      
      // If no tasks were created but networks were selected, something went wrong silently
      if (tasks.length === 0 && (selectedNetworks.facebook || selectedNetworks.instagram)) {
        // Toast was already shown for missing credentials or images
      }
      
      return { success: hasSuccess && !hasError };
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

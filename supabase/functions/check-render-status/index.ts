
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Requête check-render-status avec les données:", JSON.stringify(body, null, 2));

    if (!body.renderId) {
      throw new Error("ID de rendu manquant");
    }

    const renderId = body.renderId;
    console.log(`Vérification du statut pour le renderId: ${renderId}`);

    // Configurer le client Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Vérifier d'abord dans les tables de rendu (slideshow ou banner)
    
    // Essayer d'abord la table slideshow_renders
    const { data: slideshowData, error: slideshowError } = await supabase
      .from("slideshow_renders")
      .select("*")
      .eq("render_id", renderId)
      .maybeSingle();
      
    if (slideshowData) {
      console.log("Données du slideshow trouvées:", slideshowData);
      
      if (slideshowData.status === "completed" && slideshowData.video_url) {
        // S'assurer que la table listings possède aussi l'URL vidéo
        if (slideshowData.listing_id) {
          const { error: listingUpdateError } = await supabase
            .from("listings")
            .update({ 
              video_url: slideshowData.video_url,
              updated_at: new Date().toISOString()
            })
            .eq("id", slideshowData.listing_id);
          if (listingUpdateError) {
            console.error("Erreur lors de la mise à jour du listing.video_url:", listingUpdateError);
          } else {
            console.log("Listing.video_url mis à jour depuis check-render-status (déjà complété en DB)");
          }
        }
        return new Response(
          JSON.stringify({
            status: "done",
            videoUrl: slideshowData.video_url,
            message: "Rendu terminé, URL disponible"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Si le slideshow n'est pas complété, vérifier avec Shotstack
      console.log("Le slideshow n'est pas complété, vérification avec l'API Shotstack");
    } else if (slideshowError) {
      console.log("Pas de données slideshow trouvées, vérification de la table banner");
    }
    
    // Si pas de slideshow, essayer la table sold_banner_renders
    const { data: bannerData, error: bannerError } = await supabase
      .from("sold_banner_renders")
      .select("*")
      .eq("render_id", renderId)
      .maybeSingle();

    if (bannerData) {
      console.log("Données de la bannière trouvées:", bannerData);
      
      if (bannerData.status === "completed" && bannerData.image_url) {
        return new Response(
          JSON.stringify({
            status: "done",
            url: bannerData.image_url,
            message: "Rendu terminé, URL disponible"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (bannerError) {
      console.log("Pas de données banner trouvées non plus:", bannerError);
      if (!slideshowData) {
        console.error("Aucune donnée de rendu trouvée pour cet ID");
      }
    }

    // 2. Si pas complété en DB, vérifier avec l'API Shotstack
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("Clé API Shotstack non configurée");
    }

    console.log("Appel à l'API Shotstack pour vérifier le statut...");
    
    try {
      const response = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        console.error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error("Réponse d'erreur:", errorText);
        
        // Si l'erreur est 404, cela pourrait signifier que le rendu n'existe pas encore
        // Retourner un statut en cours au lieu d'une erreur
        if (response.status === 404 || response.status === 400) {
          console.log("Rendu non trouvé ou en cours de traitement, retourner status 'rendering'");
          
          // Mettre à jour le statut dans la base de données si nécessaire
          if (slideshowData) {
            await supabase
              .from("slideshow_renders")
              .update({ 
                status: "rendering",
                updated_at: new Date().toISOString()
              })
              .eq("render_id", renderId);
          } else if (bannerData) {
            await supabase
              .from("sold_banner_renders")
              .update({ 
                status: "rendering",
                updated_at: new Date().toISOString()
              })
              .eq("render_id", renderId);
          }
          
          return new Response(
            JSON.stringify({
              status: "rendering",
              message: "Rendu en cours de traitement"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`Erreur lors de la vérification du statut: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Réponse de Shotstack:", JSON.stringify(result, null, 2));

      let status = result.response?.status;
      let url = result.response?.url;

      // Déterminer et mettre à jour la table appropriée
      if (status) {
        if (slideshowData) {
          // C'est un rendu de slideshow
          if (status === "done" && url) {
            // Mettre à jour le statut dans la base de données
            const { error: updateError } = await supabase
              .from("slideshow_renders")
              .update({ 
                status: "completed", 
                video_url: url,
                updated_at: new Date().toISOString()
              })
              .eq("render_id", renderId);

            if (updateError) {
              console.error("Erreur lors de la mise à jour du statut du slideshow:", updateError);
            } else {
              console.log(`Statut du slideshow mis à jour avec succès pour le renderId: ${renderId}`);
              // Mettre à jour également la table listings avec l'URL vidéo
              if (slideshowData.listing_id) {
                const { error: listingUpdateError } = await supabase
                  .from("listings")
                  .update({ 
                    video_url: url,
                    updated_at: new Date().toISOString()
                  })
                  .eq("id", slideshowData.listing_id);
                if (listingUpdateError) {
                  console.error("Erreur lors de la mise à jour du listing.video_url:", listingUpdateError);
                } else {
                  console.log("Listing.video_url mis à jour depuis check-render-status (statut=done)");
                }
              }
            }
          } else if (status === "failed") {
            // Mettre à jour le statut dans la base de données
            const { error: updateError } = await supabase
              .from("slideshow_renders")
              .update({ 
                status: "error",
                updated_at: new Date().toISOString()
              })
              .eq("render_id", renderId);

            if (updateError) {
              console.error("Erreur lors de la mise à jour du statut:", updateError);
            }
          }
        } else if (bannerData) {
          // C'est un rendu de bannière
          if (status === "done" && url) {
            // Mettre à jour le statut dans la base de données
            const { error: updateError } = await supabase
              .from("sold_banner_renders")
              .update({ 
                status: "completed", 
                image_url: url,
                updated_at: new Date().toISOString()
              })
              .eq("render_id", renderId);

            if (updateError) {
              console.error("Erreur lors de la mise à jour du statut de la bannière:", updateError);
            } else {
              console.log(`Statut de la bannière mis à jour avec succès pour le renderId: ${renderId}`);
            }
          } else if (status === "failed") {
            // Mettre à jour le statut dans la base de données
            const { error: updateError } = await supabase
              .from("sold_banner_renders")
              .update({ 
                status: "failed",
                updated_at: new Date().toISOString()
              })
              .eq("render_id", renderId);

            if (updateError) {
              console.error("Erreur lors de la mise à jour du statut:", updateError);
            }
          }
        }
      }

      return new Response(
        JSON.stringify({
          status: status,
          url: url,
          videoUrl: url, // Pour compatibilité avec le client qui attend parfois videoUrl
          message: `Statut actuel: ${status}`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (apiError) {
      console.error("Erreur API Shotstack:", apiError);
      
      // En cas d'erreur de l'API, retourner un statut en cours
      return new Response(
        JSON.stringify({
          status: "rendering",
          message: "Erreur lors de la vérification, rendu présumé en cours"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Erreur générale:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

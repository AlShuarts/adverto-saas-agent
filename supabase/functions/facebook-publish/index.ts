import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Fonction Facebook-publish appelée");
  
  if (req.method === "OPTIONS") {
    console.log("Requête OPTIONS reçue");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Début du traitement de la requête");
    const { message, images, video, pageId, accessToken } = await req.json();
    console.log("Données reçues:", { 
      messageLength: message?.length,
      imagesCount: images?.length,
      hasVideo: !!video,
      pageId: pageId ? "présent" : "manquant",
      accessToken: accessToken ? "présent" : "manquant"
    });

    if (!pageId || !accessToken) {
      console.error("Paramètres manquants:", { pageId: !!pageId, accessToken: !!accessToken });
      throw new Error("Paramètres de page Facebook manquants");
    }

    // Vérifier d'abord la validité du token de la page
    console.log("Vérification du token de la page Facebook...");
    const pageTokenCheckResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=id,name&access_token=${accessToken}`
    );
    
    if (!pageTokenCheckResponse.ok) {
      const errorText = await pageTokenCheckResponse.text();
      console.error("Erreur lors de la vérification du token de la page:", errorText);
      throw new Error("Token Facebook invalide ou expiré. Veuillez reconnecter votre page Facebook.");
    }

    const pageData = await pageTokenCheckResponse.json();
    if (pageData.error) {
      console.error("Erreur dans les données de la page:", pageData.error);
      throw new Error("Token Facebook invalide ou expiré. Veuillez reconnecter votre page Facebook.");
    }

    console.log("Token valide pour la page:", pageData.name);

    let postData;
    let endpoint;

    if (video) {
      // Publication d'une vidéo
      console.log("Tentative de publication de la vidéo:", video);
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/videos`;
      postData = {
        description: message,
        file_url: video,
        access_token: accessToken,
      };
    } else if (images && images.length > 0) {
      // Publication d'images
      console.log(`Début du téléchargement de ${images.length} image(s)`);
      const imageIds = [];
      for (const imageUrl of images) {
        if (!imageUrl) continue;
        
        const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: imageUrl,
            published: false,
            access_token: accessToken,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erreur lors du téléchargement de l'image. Réponse:", errorText);
          throw new Error("Erreur lors du téléchargement de l'image sur Facebook. Veuillez réessayer.");
        }

        const responseData = await response.json();
        if (responseData.error) {
          console.error("Erreur lors du téléchargement de l'image:", responseData.error);
          throw new Error(responseData.error?.message || "Erreur lors du téléchargement de l'image");
        }

        console.log("Image téléchargée avec succès, ID:", responseData.id);
        imageIds.push({ media_fbid: responseData.id });
      }

      endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      postData = {
        message,
        access_token: accessToken,
        attached_media: imageIds,
      };
    } else {
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      postData = {
        message,
        access_token: accessToken,
      };
    }

    console.log("Tentative de publication avec endpoint:", endpoint);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur lors de la publication. Réponse:", errorText);
      throw new Error("Erreur lors de la publication sur Facebook. Veuillez réessayer.");
    }

    const responseData = await response.json();
    if (responseData.error) {
      console.error("Erreur lors de la publication:", responseData.error);
      throw new Error(responseData.error?.message || "Erreur lors de la publication sur Facebook");
    }

    console.log("Publication réussie avec l'ID:", responseData.id);

    // Récupérer l'utilisateur courant
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const jwt = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

      if (!userError && user) {
        console.log(`Utilisateur authentifié: ${user.id}`);
        // Incrémenter les statistiques d'utilisation
        try {
          // Vérifier d'abord si une entrée existe pour l'utilisateur
          const { data: statCheck } = await supabase
            .from('usage_statistics')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!statCheck) {
            // Créer une entrée si elle n'existe pas
            await supabase
              .from('usage_statistics')
              .insert([{ user_id: user.id }]);
          }
          
          // Déterminer le type de statistique à incrémenter
          let statType = 'facebook';
          if (video) {
            statType = 'facebook'; // C'est une vidéo pour Facebook
          } else {
            // Si c'est un post avec des images sans vidéo, vérifier si c'est pour Instagram
            const reqUrl = req.url.toLowerCase();
            if (reqUrl.includes('instagram')) {
              statType = 'instagram';
            }
          }
          
          // Incrémenter la statistique
          const { error: statError } = await supabase.rpc(
            'increment_usage_statistic',
            {
              user_id_param: user.id,
              statistic_type: statType
            }
          );
  
          if (statError) {
            console.error(`Erreur lors de la mise à jour des statistiques (${statType}):`, statError);
          } else {
            console.log(`Statistiques ${statType} mises à jour avec succès`);
          }
        } catch (statErr) {
          console.error("Exception lors de la mise à jour des statistiques:", statErr);
        }
      }
    }

    return new Response(JSON.stringify({ id: responseData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erreur inconnue",
        details: error.toString()
      }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

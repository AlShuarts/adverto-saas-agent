import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { facebookPublishSchema } from "../_shared/validation.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  console.log("Fonction Facebook-publish appelée");
  
  if (req.method === "OPTIONS") {
    console.log("Requête OPTIONS reçue");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Début du traitement de la requête");
    
    // Parse and validate input
    const rawData = await req.json();
    const validatedData = facebookPublishSchema.parse(rawData);
    let { message, images, video, pageId, accessToken } = validatedData;
    
    console.log("Données validées:", { 
      messageLength: message?.length,
      imagesCount: images?.length,
      hasVideo: !!video,
      hasPageId: !!pageId,
      hasAccessToken: !!accessToken
    });

    // If credentials not provided by client, fetch them server-side
    if (!pageId || !accessToken) {
      console.log("Credentials manquants, récupération côté serveur...");
      
      // Get JWT from Authorization header
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        console.error("Aucun header Authorization fourni");
        throw new Error("Authentication requise. Veuillez vous reconnecter.");
      }

      const jwt = authHeader.replace("Bearer ", "");
      
      // Get user from JWT
      const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
      if (userError || !user) {
        console.error("Erreur d'authentification:", userError);
        throw new Error("Erreur d'authentification. Veuillez vous reconnecter.");
      }

      console.log(`Utilisateur authentifié: ${user.id}`);

      // Fetch Facebook credentials from profile via RPC
      const { data: fbCreds, error: fbError } = await supabase
        .rpc('get_facebook_credentials', { _user_id: user.id });

      if (fbError) {
        console.error("Erreur lors de la récupération des credentials:", fbError);
        throw new Error("Erreur lors de la récupération de vos credentials Facebook.");
      }

      if (!fbCreds || fbCreds.length === 0 || !fbCreds[0].page_id || !fbCreds[0].access_token) {
        console.error("Credentials Facebook non trouvés pour l'utilisateur");
        throw new Error("Veuillez connecter votre page Facebook dans votre profil.");
      }

      pageId = fbCreds[0].page_id;
      accessToken = fbCreds[0].access_token;
      console.log("Credentials récupérés avec succès depuis le profil");
    } else {
      console.log("Credentials fournis par le client");
    }

    // Vérifier d'abord la validité du token de la page
    console.log("Vérification du token de la page Facebook...");
    
    // Nettoyer le token au cas où il aurait des caractères indésirables
    const cleanToken = accessToken.trim();
    
    try {
      const pageTokenCheckResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=id,name&access_token=${encodeURIComponent(cleanToken)}`
      );
      
      if (!pageTokenCheckResponse.ok) {
        const errorText = await pageTokenCheckResponse.text();
        console.error("Erreur lors de la vérification du token de la page:", errorText);
        
        // Si c'est une erreur de token invalide, suggérer de reconnecter
        if (errorText.includes("Invalid OAuth") || errorText.includes("code\":190")) {
          throw new Error("Votre token Facebook a expiré. Veuillez vous reconnecter à votre page Facebook dans votre profil.");
        }
        throw new Error("Erreur de connexion à Facebook. Veuillez réessayer.");
      }

      const pageData = await pageTokenCheckResponse.json();
      if (pageData.error) {
        console.error("Erreur dans les données de la page:", pageData.error);
        
        if (pageData.error.code === 190) {
          throw new Error("Votre token Facebook a expiré. Veuillez vous reconnecter à votre page Facebook dans votre profil.");
        }
        throw new Error("Erreur d'accès à votre page Facebook. Veuillez vérifier vos permissions.");
      }
      
      console.log("Token valide pour la page:", pageData.name);
    } catch (networkError) {
      console.error("Erreur réseau lors de la vérification du token:", networkError);
      if (networkError.message.includes("token")) {
        throw networkError; // Rethrow token errors as is
      }
      throw new Error("Erreur de connexion à Facebook. Veuillez vérifier votre connexion internet.");
    }

    let postData;
    let endpoint;

    if (video) {
      // Publication d'une vidéo
      console.log("Tentative de publication de la vidéo:", video);
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/videos`;
      postData = {
        description: message,
        file_url: video,
        access_token: cleanToken,
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
            access_token: cleanToken,
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
        access_token: cleanToken,
        attached_media: imageIds,
      };
    } else {
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      postData = {
        message,
        access_token: cleanToken,
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

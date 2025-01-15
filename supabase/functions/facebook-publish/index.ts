import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, images, pageId, accessToken } = await req.json();
    console.log("Tentative de publication sur Facebook pour la page:", pageId);
    console.log("Message à publier:", message);
    console.log("Nombre d'images à publier:", images?.length);

    if (!pageId || !accessToken) {
      console.error("Paramètres manquants:", { pageId: !!pageId, accessToken: !!accessToken });
      throw new Error("Paramètres de page Facebook manquants");
    }

    // Publier d'abord les images
    const imageIds = [];
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        if (!imageUrl) continue;
        
        console.log("Tentative de téléchargement de l'image:", imageUrl);
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

        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Réponse non-JSON de l'API Facebook:", responseText);
          throw new Error("Réponse invalide de l'API Facebook lors du téléchargement de l'image");
        }

        if (!response.ok) {
          console.error("Erreur lors du téléchargement de l'image:", responseData);
          throw new Error(responseData.error?.message || "Erreur lors du téléchargement de l'image");
        }

        console.log("Image téléchargée avec succès, ID:", responseData.id);
        imageIds.push({ media_fbid: responseData.id });
      }
    }

    // Créer la publication avec les images
    console.log("Tentative de création de la publication avec", imageIds.length, "images");
    const postData = {
      message,
      access_token: accessToken,
      ...(imageIds.length > 0 && { attached_media: imageIds }),
    };

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Réponse non-JSON de l'API Facebook:", responseText);
      throw new Error("Réponse invalide de l'API Facebook lors de la publication");
    }

    if (!response.ok) {
      console.error("Erreur lors de la publication:", responseData);
      throw new Error(responseData.error?.message || "Erreur lors de la publication sur Facebook");
    }

    console.log("Publication réussie avec l'ID:", responseData.id);

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
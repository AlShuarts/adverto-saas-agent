import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, images, pageId, accessToken } = await req.json();

    // Publier d'abord les images
    const imageIds = [];
    for (const imageUrl of images) {
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
        throw new Error(`Erreur lors du téléchargement de l'image: ${await response.text()}`);
      }

      const { id } = await response.json();
      imageIds.push({ media_fbid: id });
    }

    // Créer la publication avec les images
    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        attached_media: imageIds,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la publication: ${await response.text()}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
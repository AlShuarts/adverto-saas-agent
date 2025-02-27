import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔹 Démarrage de la fonction create-slideshow");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("❌ Pas d'en-tête d'autorisation.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      throw new Error("❌ Jeton utilisateur invalide.");
    }

    const { listingId, config } = await req.json();
    const { selectedImages, infoDisplayConfig } = config;

    if (!listingId || !config) {
      return new Response(
        JSON.stringify({ error: "❌ Paramètres requis manquants." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("📜 Configuration reçue:", JSON.stringify(config, null, 2));
    console.log("🖼️ Images sélectionnées:", selectedImages);

    console.log("📡 Récupération des données du listing.");
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      console.error("❌ Erreur lors de la récupération du listing:", listingError);
      return new Response(
        JSON.stringify({ error: "❌ Listing non trouvé." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const clips = [];
    let totalDuration = 0;

    // ✅ Ajout des images avec mouvement fluide et zoom
    selectedImages.forEach((imageUrl, index) => {
      const isZoomIn = index % 2 === 0;
      const isSlideLeft = index % 2 === 0;
      
      clips.push({
        asset: { type: "image", src: imageUrl },
        start: Math.max(totalDuration, 0),
        length: config.imageDuration,
        effect: isZoomIn ? "zoomIn" : "zoomOut",
        animate: [
          {
            scale: 1.05,
            offset: { x: isSlideLeft ? -0.05 : 0.05, y: 0 },
          },
        ],
      });
      totalDuration += config.imageDuration;
    });

    let infoStartTime = Math.max(0, totalDuration / 2 - infoDisplayConfig.duration / 2);
    
    if (config.showDetails) {
      if (config.showPrice) {
        clips.push({
          asset: {
            type: "html",
            html: `<p style='color: white; font-size: 48px; text-align: center; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);'>${formatPrice(listing.price)}</p>`,
            width: 800,
            height: 100,
          },
          start: infoStartTime,
          length: infoDisplayConfig.duration,
          position: "center",
          offset: { y: -0.2 },
        });
      }
    }

    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/shotstack-webhook?auth=${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;

    const renderPayload = {
      timeline: { background: "#000000", tracks: [{ clips }] },
      output: { format: "mp4", resolution: "hd" },
      callback: webhookUrl,
    };

    if (config.musicVolume > 0) {
      renderPayload.timeline.soundtrack = {
        src: "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/berlin.mp3",
        effect: "fadeInFadeOut",
        volume: config.musicVolume,
      };
    }

    console.log("📤 Payload Shotstack:", JSON.stringify(renderPayload, null, 2));

    console.log("🚀 Envoi du rendu à Shotstack.");
    const response = await fetch("https://api.shotstack.io/v1/render", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("SHOTSTACK_API_KEY") ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(renderPayload),
    });

    console.log("✅ Shotstack status:", response.status);
    const responseData = await response.json();
    console.log("📝 Shotstack response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      throw new Error(`Shotstack API error: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    const renderId = responseData.response?.id;
    if (!renderId) {
      throw new Error("❌ Réponse invalide de Shotstack.");
    }

    await supabase.from("slideshow_renders").insert({
      listing_id: listingId,
      render_id: renderId,
      status: "pending",
      user_id: user.id,
    });

    return new Response(
      JSON.stringify({ success: true, renderId, message: "Vidéo en cours de génération." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("⚠️ Erreur:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

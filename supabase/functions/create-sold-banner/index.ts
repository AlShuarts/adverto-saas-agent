
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { renderWithShotstack } from "./services/shotstackService.ts";
import { generateSoldBannerClip } from "./utils/bannerGenerator.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔹 Démarrage de la fonction create-sold-banner");

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

    const requestData = await req.json();
    console.log("📝 Données de la requête:", JSON.stringify(requestData, null, 2));
    
    const { listingId, config } = requestData;
    
    if (!listingId || !config) {
      return new Response(
        JSON.stringify({ error: "❌ Paramètres requis manquants." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("📜 Configuration reçue:", JSON.stringify(config, null, 2));
    console.log("🖼️ Image principale:", config.mainImage);
    
    // Récupérer les données du listing
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError) {
      throw new Error(`❌ Listing non trouvé: ${listingError.message}`);
    }

    console.log("📋 Données du listing:", JSON.stringify(listing, null, 2));

    // Récupérer les données du profil utilisateur pour les coordonnées
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.warn("⚠️ Profil utilisateur non trouvé, utilisation des valeurs par défaut");
    }

    // Générer les clips pour la bannière
    const { clips, totalDuration } = generateSoldBannerClip({
      mainImage: config.mainImage,
      brokerImage: config.brokerImage || null,
      agencyLogo: config.agencyLogo || null,
      brokerName: config.brokerName || profile?.full_name || "Courtier immobilier",
      brokerEmail: config.brokerEmail || profile?.email || user.email || "",
      brokerPhone: config.brokerPhone || profile?.phone || "",
      address: listing.address || "",
      config
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
    const webhookUrl = `${supabaseUrl}/functions/v1/shotstack-webhook`;
    
    console.log("🔗 URL du webhook configurée:", webhookUrl);

    const renderPayload = {
      timeline: {
        background: "#000000",
        tracks: [
          { clips }
        ],
      },
      output: { 
        format: "png", 
        resolution: "hd",
        aspectRatio: "16:9" 
      },
      callback: webhookUrl,
    };

    console.log("📤 Payload Shotstack:", JSON.stringify(renderPayload, null, 2));
    
    // Faire le rendu avec Shotstack
    const renderId = await renderWithShotstack(renderPayload);
    
    // Enregistrer les informations du rendu dans la base de données
    await supabase
      .from("sold_banner_renders")
      .insert({
        listing_id: listingId,
        render_id: renderId,
        user_id: user.id,
        status: "pending"
      });

    return new Response(
      JSON.stringify({ success: true, renderId, message: "Bannière en cours de génération." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("⚠️ Erreur:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

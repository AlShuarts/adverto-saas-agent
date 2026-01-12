
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { renderWithShotstack } from "./services/shotstackService.ts";
import { generateSoldBannerClip } from "./utils/bannerGenerator.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { bannerCreateSchema } from "../_shared/validation.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  console.log("🔔 DÉMARRAGE de la fonction create-sold-banner, méthode:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔹 Démarrage de la fonction create-sold-banner");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("❌ Pas d'en-tête d'autorisation.");
    }

    // Extraire le token JWT de l'en-tête Authorization
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new Error("❌ Jeton manquant dans l'en-tête Authorization");
    }

    // Create Supabase client with ANON_KEY to enforce RLS policies when accessing user data
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Passer explicitement le token à getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("❌ Erreur d'authentification:", userError);
      throw new Error("❌ Jeton utilisateur invalide.");
    }
    
    console.log("✅ Utilisateur authentifié:", user.id);

    // Parse and validate input
    const rawData = await req.json();
    const validatedData = bannerCreateSchema.parse(rawData);
    const { listingId, config } = validatedData;
    
    console.log("📝 DONNÉES VALIDÉES:", JSON.stringify({ listingId, config }, null, 2));
    console.log("🖼️ Image principale:", config.mainImage);
    
    // Create service role client only for listing and render operations (not user data)
    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les données du listing
    const { data: listing, error: listingError } = await supabaseServiceRole
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .eq("user_id", user.id)
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

    const bannerType = config.bannerType || "VENDU";

    // Générer les tracks pour la bannière
    console.log("🔄 Génération des tracks avec les paramètres suivants:");
    const bannerParams = {
      mainImage: config.mainImage,
      brokerImage: config.brokerImage || null,
      agencyLogo: config.agencyLogo || null,
      brokerName: config.brokerName || profile?.full_name || "Courtier immobilier",
      brokerEmail: config.brokerEmail || user.email || "",
      brokerPhone: config.brokerPhone || profile?.phone || "",
      address: listing.address || "",
      bannerType,
      config
    };
    console.log(JSON.stringify(bannerParams, null, 2));
    
    const { tracks, totalDuration } = generateSoldBannerClip(bannerParams);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
    const webhookSecret = Deno.env.get("SHOTSTACK_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("SHOTSTACK_WEBHOOK_SECRET not configured");
    }
    const webhookUrl = `${supabaseUrl}/functions/v1/shotstack-webhook?secret=${encodeURIComponent(webhookSecret)}`;
    
    console.log("🔗 URL du webhook configurée (secret masked)");

    // Vérifier la disponibilité de la clé API Shotstack
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack non configurée");
    }

    const renderPayload = {
      timeline: {
        background: "#000000",
        tracks: tracks
      },
      output: { 
        format: "png", 
        aspectRatio: "16:9",
        fps: 25,
        size: {
          width: 1280,
          height: 720
        }
      },
      callback: webhookUrl,
    };

    console.log("📤 PAYLOAD COMPLET pour Shotstack:", JSON.stringify(renderPayload, null, 2));
    
    // Faire le rendu avec Shotstack
    const renderId = await renderWithShotstack(renderPayload);
    
    // Enregistrer les informations du rendu dans la base de données (use service role for system operation)
    const { data: insertData, error: insertError } = await supabaseServiceRole
      .from("sold_banner_renders")
      .insert({
        listing_id: listingId,
        render_id: renderId,
        user_id: user.id,
        status: "pending",
        banner_type: bannerType
      });
      
    if (insertError) {
      console.error("❌ Erreur lors de l'enregistrement du rendu:", insertError);
      throw new Error(`Erreur lors de l'enregistrement du rendu: ${insertError.message}`);
    }

    console.log("✅ Rendu créé et enregistré avec succès, ID:", renderId);

    // Mise à jour des statistiques (use service role for system operation)
    try {
      await supabaseServiceRole.rpc(
        'increment_usage_statistic',
        {
          user_id_param: user.id,
          statistic_type: 'banner'
        }
      );
      console.log("✅ Statistiques mises à jour avec succès");
    } catch (statErr) {
      console.error("⚠️ Exception lors de la mise à jour des statistiques:", statErr);
    }

    return new Response(
      JSON.stringify({ success: true, renderId, message: "Bannière en cours de génération." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("⚠️ ERREUR CRITIQUE:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

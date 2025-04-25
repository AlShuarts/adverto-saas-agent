
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { prepareTextElements } from "./utils/textElements.ts";
import { generateTemplateVariables } from "./utils/clipGenerator.ts";
import { renderWithShotstackTemplate, getShotstackTemplates } from "./services/shotstackService.ts";
import { getListingById, saveRenderRecord } from "./services/databaseService.ts";
import { validateUser } from "./services/authService.ts";
import { updateUsageStatistics } from "./services/statisticsService.ts";
import { validateConfig } from "./services/configService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔹 Démarrage de la fonction create-slideshow");

    // Authentification
    const { user, supabase } = await validateUser(req.headers.get("authorization"));

    // Récupération et validation des données
    const requestData = await req.json();
    console.log("📝 Données de la requête:", JSON.stringify(requestData, null, 2));
    
    const { listingId, config: rawConfig } = requestData;
    if (!listingId) {
      return new Response(
        JSON.stringify({ error: "❌ ID de l'annonce manquant." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validation et préparation de la configuration
    const config = validateConfig(rawConfig);
    console.log("📜 Configuration reçue:", JSON.stringify(config, null, 2));
    console.log("🖼️ Images sélectionnées:", config.selectedImages);

    // Template ID pour Shotstack
    const TEMPLATE_ID = "dbbf3bc7-0bff-432b-896e-f736aa04bbd6";
    const USE_TEMPLATE = true;

    // Récupération des données de l'annonce
    const listing = await getListingById(supabase, listingId);
    console.log("📋 Données du listing:", JSON.stringify(listing, null, 2));

    // Préparation des éléments de texte
    const textElements = prepareTextElements(listing, config);
    console.log("📝 Éléments de texte préparés:", textElements);

    // Configuration du webhook
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/shotstack-webhook`;
    console.log("🔗 URL du webhook configurée:", webhookUrl);
    
    let renderId;
    
    if (USE_TEMPLATE) {
      console.log("🧩 Utilisation du template Shotstack ID:", TEMPLATE_ID);
      
      const { mergeVariables, totalDuration } = generateTemplateVariables(
        config.selectedImages,
        textElements,
        config
      );
      
      renderId = await renderWithShotstackTemplate(
        TEMPLATE_ID,
        mergeVariables,
        webhookUrl
      );
      
      console.log("🎬 Rendu initialisé avec le template, ID:", renderId);
    } else {
      throw new Error("Mode sans template non supporté");
    }
    
    // Enregistrement du rendu dans la base de données
    await saveRenderRecord(supabase, {
      listingId,
      renderId,
      userId: user.id
    });

    // Mise à jour des statistiques
    await updateUsageStatistics(supabase, user.id);

    return new Response(
      JSON.stringify({ success: true, renderId, message: "Vidéo en cours de génération." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("⚠️ Erreur:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

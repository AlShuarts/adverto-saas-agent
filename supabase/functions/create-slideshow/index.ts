
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { prepareTextElements } from "./utils/textElements.ts";
import { generateSlideshowTimeline } from "./utils/clipGenerator.ts";
import { renderWithShotstack } from "./services/shotstack/renderService.ts";
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
    const { user, supabase, supabaseServiceRole } = await validateUser(req.headers.get("authorization"));

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
    console.log("🎵 Vérification de la musique dans la requête:", rawConfig.selectedMusic || "aucune musique");
    const config = validateConfig(rawConfig);
    console.log("📜 Configuration validée:", JSON.stringify(config, null, 2));
    console.log("🖼️ Images sélectionnées:", config.selectedImages.length, "images");
    console.log("🎵 URL de musique après traitement:", config.musicUrl || "aucune");

    // Récupération des données de l'annonce (use user's client to enforce RLS)
    const listing = await getListingById(supabase, listingId);
    console.log("📋 Données du listing récupérées avec succès");

    // Préparation des éléments de texte
    const textElements = prepareTextElements(listing, config);
    console.log("📝 Éléments de texte préparés:", textElements);

    // Configuration du webhook
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/shotstack-webhook`;
    console.log("🔗 URL du webhook configurée:", webhookUrl);
    
    // Génération de la timeline pour le diaporama
    const timeline = generateSlideshowTimeline(config.selectedImages, textElements, config);
    console.log("🎬 Timeline générée avec succès");
    
    // Initialisation du rendu avec Shotstack
    const renderId = await renderWithShotstack(timeline, webhookUrl);
    console.log("🎬 Rendu initialisé, ID:", renderId);
    
    // Enregistrement du rendu dans la base de données (use service role for system operation)
    await saveRenderRecord(supabaseServiceRole, {
      listingId,
      renderId,
      userId: user.id
    });

    // Mise à jour des statistiques (use service role for system operation)
    await updateUsageStatistics(supabaseServiceRole, user.id);

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

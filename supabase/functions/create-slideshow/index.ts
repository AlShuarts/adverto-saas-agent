
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { prepareTextElements } from "./utils/textElements.ts";
import { generateSlideShowClips } from "./utils/clipGenerator.ts";
import { renderWithShotstack } from "./services/shotstackService.ts";
import { getListingById, saveRenderRecord } from "./services/databaseService.ts";

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

    // Récupérer les données du listing
    const listing = await getListingById(supabase, listingId);
    console.log("📋 Données du listing:", JSON.stringify(listing, null, 2));

    // Préparer les éléments de texte
    const textElements = prepareTextElements(listing, config);
    console.log("📝 Éléments de texte préparés:", textElements);

    // Vérifier si nous avons des éléments de texte
    if (textElements.length === 0) {
      console.log("⚠️ Aucun élément de texte n'a été généré - vérifiez les données du listing et la configuration");
    }

    // Générer les clips pour le diaporama
    const { clips, totalDuration } = generateSlideShowClips(selectedImages, textElements, config);
    console.log("🎬 Nombre de clips générés:", clips.length);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
    const webhookUrl = `${supabaseUrl}/functions/v1/shotstack-webhook`;
    
    console.log("🔗 URL du webhook configurée:", webhookUrl);

    const renderPayload = {
      timeline: { background: "#000000", tracks: [{ clips }] },
      output: { format: "mp4", resolution: "hd" },
      callback: webhookUrl,
    };

    console.log("📤 Payload Shotstack:", JSON.stringify(renderPayload, null, 2));
    
    // Faire le rendu avec Shotstack
    const renderId = await renderWithShotstack(renderPayload);
    
    // Enregistrer les informations du rendu dans la base de données
    await saveRenderRecord(supabase, {
      listingId,
      renderId,
      userId: user.id
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

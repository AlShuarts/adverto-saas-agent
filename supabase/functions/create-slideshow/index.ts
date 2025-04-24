
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
    console.log("🖼️ Images sélectionnées:", config.selectedImages);
    
    // Gestion de la musique
    if (config.musicUrl) {
      console.log("🎵 URL de la musique déjà fournie:", config.musicUrl);
    } else if (config.selectedMusic) {
      console.log("🎵 Musique sélectionnée (nom de fichier):", config.selectedMusic);
      // Construction de l'URL complète si nécessaire
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
      config.musicUrl = `${supabaseUrl}/storage/v1/object/public/background-music/${config.selectedMusic}`;
      console.log("🎵 URL de la musique générée:", config.musicUrl);
    } else {
      console.log("🔇 Aucune musique sélectionnée");
    }

    const listing = await getListingById(supabase, listingId);
    console.log("📋 Données du listing:", JSON.stringify(listing, null, 2));

    const textElements = prepareTextElements(listing, config);
    console.log("📝 Éléments de texte préparés:", textElements);

    const { clips, totalDuration } = generateSlideShowClips(config.selectedImages, textElements, config);
    console.log("🎬 Nombre de clips générés:", clips.length);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
    const webhookUrl = `${supabaseUrl}/functions/v1/shotstack-webhook`;
    
    console.log("🔗 URL du webhook configurée:", webhookUrl);

    const renderPayload = {
      timeline: {
        background: "#000000",
        tracks: [
          { clips }, // Track des images et des textes
        ],
      },
      output: { format: "mp4", resolution: "hd" },
      callback: webhookUrl,
    };

    console.log("📤 Payload Shotstack:", JSON.stringify(renderPayload, null, 2));
    
    const renderId = await renderWithShotstack(renderPayload);
    
    await saveRenderRecord(supabase, {
      listingId,
      renderId,
      userId: user.id
    });

    // Mise à jour directe des statistiques au lieu d'utiliser la fonction RPC
    try {
      // Vérifier si une entrée existe déjà
      const { data: existingStat, error: fetchError } = await supabase
        .from('usage_statistics')
        .select('id, slideshow_generations')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("⚠️ Erreur lors de la vérification des statistiques:", fetchError);
      } else if (!existingStat) {
        // Créer une nouvelle entrée avec les valeurs par défaut
        const { error: insertError } = await supabase
          .from('usage_statistics')
          .insert([{ 
            user_id: user.id, 
            description_generations: 0, 
            slideshow_generations: 1, 
            facebook_generations: 0, 
            instagram_generations: 0 
          }]);
        
        if (insertError) {
          console.error("⚠️ Erreur lors de la création des statistiques:", insertError);
        } else {
          console.log("✅ Nouvelle entrée statistique créée avec succès");
        }
      } else {
        // Incrémenter le compteur existant
        const currentValue = existingStat.slideshow_generations || 0;
        const { error: updateError } = await supabase
          .from('usage_statistics')
          .update({ slideshow_generations: currentValue + 1 })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error("⚠️ Erreur lors de la mise à jour des statistiques:", updateError);
        } else {
          console.log(`✅ Compteur slideshow incrémenté de ${currentValue} à ${currentValue + 1}`);
        }
      }
    } catch (statErr) {
      console.error("⚠️ Exception lors de la mise à jour des statistiques:", statErr);
    }

    return new Response(
      JSON.stringify({ success: true, renderId, message: "Vidéo en cours de génération." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("⚠️ Erreur:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

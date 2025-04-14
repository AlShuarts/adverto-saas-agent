
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { renderId } = await req.json();
    
    console.log("🔍 Vérification du statut pour le rendu ID:", renderId);

    if (!renderId) {
      throw new Error("❌ ID de rendu manquant dans la requête.");
    }

    // Vérification de la clé d'API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }

    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("❌ Variables d'environnement Supabase manquantes.");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Effectuer 3 tentatives maximum
    let attempt = 0;
    const maxAttempts = 3;
    let lastError;

    while (attempt < maxAttempts) {
      try {
        console.log(`✨ Tentative #${attempt+1} de vérification du statut pour le rendu ID: ${renderId}`);
        
        const response = await fetch(`https://api.shotstack.io/stage/render/${renderId}`, {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
          },
        });

        console.log("👉 Statut de la réponse HTTP:", response.status);
        
        const responseData = await response.json();
        console.log("📝 Réponse de l'API de statut:", JSON.stringify(responseData, null, 2));

        if (!response.ok) {
          throw new Error(`Shotstack API error: ${response.status} ${JSON.stringify(responseData)}`);
        }

        // Extraire les informations pertinentes
        const status = responseData?.response?.status;
        const url = responseData?.response?.url;
        const error = responseData?.response?.error;

        console.log("✅ Statut du rendu:", status);
        console.log("✅ URL de la vidéo (si disponible):", url);

        // Si le statut est "done" ou "failed", mettre à jour la base de données
        if (status === "done" || status === "failed") {
          console.log("🔄 Le rendu est terminé, mise à jour de la base de données...");
          
          try {
            // Rechercher le rendu dans la base de données
            const { data: renders, error: findError } = await supabase
              .from("slideshow_renders")
              .select("*")
              .eq("render_id", renderId);
              
            if (findError) {
              console.error("❌ Erreur lors de la recherche du rendu:", findError);
            } else if (renders && renders.length > 0) {
              console.log("📊 Rendu trouvé dans la base de données:", renders[0]);
              
              // Préparer les données à mettre à jour
              const updateData: any = {
                status: status === "done" ? "completed" : "error"
              };
              
              if (status === "done" && url) {
                updateData.video_url = url;
                console.log("🎬 Mise à jour de l'URL de la vidéo:", url);
              }
              
              // Mettre à jour le rendu dans la base de données
              const { error: updateError } = await supabase
                .from("slideshow_renders")
                .update(updateData)
                .eq("render_id", renderId);
                
              if (updateError) {
                console.error("❌ Erreur lors de la mise à jour du statut du rendu:", updateError);
              } else {
                console.log("✅ Statut du rendu mis à jour avec succès dans la base de données");
              }
            } else {
              console.warn("⚠️ Aucun rendu trouvé avec cet ID dans la base de données");
            }
          } catch (dbError) {
            console.error("❌ Erreur lors de l'interaction avec la base de données:", dbError);
          }
        }

        return new Response(
          JSON.stringify({
            status,
            url,
            error,
            videoUrl: url,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (error) {
        console.error(`❌ Erreur lors de la tentative #${attempt+1}:`, error);
        lastError = error;
        attempt++;
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde entre les tentatives
        }
      }
    }
    
    // Toutes les tentatives ont échoué
    throw lastError || new Error("Échec des tentatives de vérification du statut.");

  } catch (error) {
    console.error("Error in check-render-status:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

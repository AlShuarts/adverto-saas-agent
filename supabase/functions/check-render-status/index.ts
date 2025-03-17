
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔹 Démarrage de la fonction check-render-status");

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

    const { renderId } = await req.json();
    
    if (!renderId) {
      return new Response(
        JSON.stringify({ error: "ID de rendu manquant" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`📋 Vérification du statut pour le rendu: ${renderId}`);

    // Appeler l'API Shotstack pour vérifier l'état du rendu
    const SHOTSTACK_API_KEY = Deno.env.get("SHOTSTACK_API_KEY");
    if (!SHOTSTACK_API_KEY) {
      throw new Error("Clé API Shotstack manquante");
    }

    const response = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
      method: "GET",
      headers: {
        "x-api-key": SHOTSTACK_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erreur API Shotstack:", errorData);
      throw new Error(`Erreur API Shotstack: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("💡 Réponse Shotstack:", JSON.stringify(data, null, 2));
    
    const status = data.response?.status;
    const url = data.response?.url;
    
    // Si le rendu est terminé, mettre à jour la base de données
    if (status === "done" && url) {
      console.log("✅ Rendu terminé avec URL:", url);
      
      // Vérifier d'abord si c'est un rendu de diaporama
      const { data: slideshowRender } = await supabase
        .from("slideshow_renders")
        .select("*")
        .eq("render_id", renderId)
        .maybeSingle();
        
      if (slideshowRender) {
        console.log("🎬 Mise à jour du diaporama");
        await supabase
          .from("slideshow_renders")
          .update({ 
            status: "completed",
            video_url: url 
          })
          .eq("render_id", renderId);
      }
      
      // Ensuite, vérifier si c'est un rendu de bannière
      const { data: bannerRender } = await supabase
        .from("sold_banner_renders")
        .select("*")
        .eq("render_id", renderId)
        .maybeSingle();
        
      if (bannerRender) {
        console.log("🏷️ Mise à jour de la bannière");
        await supabase
          .from("sold_banner_renders")
          .update({ 
            status: "completed",
            image_url: url 
          })
          .eq("render_id", renderId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status,
        url,
        message: `État du rendu: ${status}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Erreur:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

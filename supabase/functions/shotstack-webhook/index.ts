
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("💡 Shotstack webhook appelé avec:", JSON.stringify(body, null, 2));

    if (!body.id || !body.status) {
      throw new Error("Données webhook manquantes");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const renderId = body.id;
    const status = body.status;
    
    console.log(`📊 Mise à jour du rendu ${renderId} au statut: ${status}`);
    console.log(`📊 URL reçue: ${body.url || "aucune URL"}`);

    // Vérifier si c'est un rendu de diaporama
    const { data: slideshowData, error: slideshowError } = await supabase
      .from("slideshow_renders")
      .select("*")
      .eq("render_id", renderId)
      .maybeSingle();

    if (slideshowData) {
      console.log("🎬 C'est un rendu de diaporama");
      
      const updateData: any = { 
        status: status === "done" ? "completed" : status 
      };
      
      if (status === "done" && body.url) {
        updateData.video_url = body.url;
        console.log(`✅ URL vidéo mise à jour: ${body.url}`);
      }

      // Mettre à jour le statut du rendu du diaporama
      const { data, error } = await supabase
        .from("slideshow_renders")
        .update(updateData)
        .eq("render_id", renderId);

      if (error) {
        console.error("❌ Erreur lors de la mise à jour du statut du diaporama:", error);
      } else {
        console.log("✅ Statut du diaporama mis à jour avec succès");
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Vérifier si c'est un rendu de bannière VENDU
    const { data: bannerData, error: bannerError } = await supabase
      .from("sold_banner_renders")
      .select("*")
      .eq("render_id", renderId)
      .maybeSingle();

    if (bannerData) {
      console.log("🏷️ C'est un rendu de bannière");
      console.log("🔍 Données existantes:", JSON.stringify(bannerData, null, 2));
      
      const updateData: any = { 
        status: status === "done" ? "completed" : status,
        updated_at: new Date()
      };
      
      if (status === "done" && body.url) {
        updateData.image_url = body.url;
        console.log("📸 URL de l'image récupérée:", body.url);
      }

      // Mettre à jour le statut du rendu de la bannière
      const { data, error } = await supabase
        .from("sold_banner_renders")
        .update(updateData)
        .eq("render_id", renderId);

      if (error) {
        console.error("❌ Erreur lors de la mise à jour du statut de la bannière:", error);
      } else {
        console.log("✅ Statut de la bannière mis à jour avec succès");
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("⚠️ Aucun rendu correspondant trouvé pour l'ID:", renderId);
    
    return new Response(
      JSON.stringify({ success: true, message: "Aucun rendu correspondant trouvé" }),
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

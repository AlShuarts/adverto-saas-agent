import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Démarrage du nettoyage des rendus bloqués");

    // Configurer le client Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Définir le délai d'expiration (30 minutes)
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    // Nettoyer les rendus de diaporama bloqués
    const { data: stuckSlideshows, error: slideshowQueryError } = await supabase
      .from("slideshow_renders")
      .select("*")
      .in("status", ["pending", "rendering"])
      .lt("created_at", thirtyMinutesAgo.toISOString());

    if (slideshowQueryError) {
      console.error("Erreur lors de la récupération des diaporamas bloqués:", slideshowQueryError);
    } else if (stuckSlideshows && stuckSlideshows.length > 0) {
      console.log(`Trouvé ${stuckSlideshows.length} diaporama(s) bloqué(s)`);
      
      for (const render of stuckSlideshows) {
        console.log(`Suppression du rendu bloqué: ${render.render_id}`);
        
        const { error: deleteError } = await supabase
          .from("slideshow_renders")
          .delete()
          .eq("id", render.id);
          
        if (deleteError) {
          console.error(`Erreur lors de la suppression du rendu ${render.render_id}:`, deleteError);
        } else {
          console.log(`Rendu ${render.render_id} supprimé avec succès`);
        }
      }
    }

    // Nettoyer les rendus de bannière bloqués
    const { data: stuckBanners, error: bannerQueryError } = await supabase
      .from("sold_banner_renders")
      .select("*")
      .in("status", ["pending", "rendering"])
      .lt("created_at", thirtyMinutesAgo.toISOString());

    if (bannerQueryError) {
      console.error("Erreur lors de la récupération des bannières bloquées:", bannerQueryError);
    } else if (stuckBanners && stuckBanners.length > 0) {
      console.log(`Trouvé ${stuckBanners.length} bannière(s) bloquée(s)`);
      
      for (const render of stuckBanners) {
        console.log(`Suppression du rendu bloqué: ${render.render_id}`);
        
        const { error: deleteError } = await supabase
          .from("sold_banner_renders")
          .delete()
          .eq("id", render.id);
          
        if (deleteError) {
          console.error(`Erreur lors de la suppression du rendu ${render.render_id}:`, deleteError);
        } else {
          console.log(`Rendu ${render.render_id} supprimé avec succès`);
        }
      }
    }

    const totalCleaned = (stuckSlideshows?.length || 0) + (stuckBanners?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Nettoyage terminé. ${totalCleaned} rendu(s) bloqué(s) supprimé(s).`,
        slideshowsCleaned: stuckSlideshows?.length || 0,
        bannersCleaned: stuckBanners?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
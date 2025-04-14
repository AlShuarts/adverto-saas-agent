
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { renderId } = await req.json();

    if (!renderId) {
      return new Response(
        JSON.stringify({ error: "Render ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const SHOTSTACK_API_KEY = Deno.env.get("SHOTSTACK_API_KEY");
    if (!SHOTSTACK_API_KEY) {
      throw new Error("SHOTSTACK_API_KEY is not set");
    }

    console.log(`Checking status for render: ${renderId}`);

    try {
      // Vérifiez d'abord si l'ID de rendu est valide pour éviter les erreurs 400
      if (!renderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log(`Invalid render ID format: ${renderId}`);
        
        // Mettre à jour la base de données pour marquer ce rendu comme erroné
        await updateRenderStatus(renderId, "error", null);
        
        return new Response(
          JSON.stringify({ 
            error: "Invalid render ID format",
            status: "error",
            message: "Le format d'ID de rendu n'est pas valide"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      const response = await fetch(`https://api.shotstack.io/stage/render/${renderId}`, {
        method: "GET",
        headers: {
          "x-api-key": SHOTSTACK_API_KEY,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Shotstack API error: ${response.status} ${errorBody}`);
        
        // Si l'API renvoie une erreur 404 (non trouvé) ou 400 (mauvaise demande),
        // marquer le rendu comme erroné dans la base de données
        if (response.status === 404 || response.status === 400) {
          await updateRenderStatus(renderId, "error", null);
          
          return new Response(
            JSON.stringify({
              status: "error",
              error: `Shotstack API error: ${response.status}`,
              message: "Une erreur est survenue lors de la vérification du rendu"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
        
        throw new Error(`Shotstack API error: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      console.log("Shotstack API response:", JSON.stringify(data, null, 2));

      // Format the response
      const result = {
        id: data.response.id,
        status: data.response.status,
        url: data.response.url,
        videoUrl: data.response.url,
        error: data.response.error,
        message: `Current status: ${data.response.status}`
      };

      console.log("Returning result:", JSON.stringify(result, null, 2));

      // Update database with latest status if needed
      if (data.response.status === "done" || data.response.status === "failed") {
        await updateRenderStatus(
          renderId, 
          data.response.status === "done" ? "completed" : "error", 
          data.response.url
        );
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (apiError) {
      console.error("Error calling Shotstack API:", apiError);
      
      // En cas d'erreur de l'API, mettons à jour le statut dans la base de données
      await updateRenderStatus(renderId, "error", null);
      
      return new Response(
        JSON.stringify({
          status: "error",
          error: apiError.message,
          message: "Une erreur est survenue lors de la communication avec l'API Shotstack"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in check-render-status:", error);
    return new Response(
      JSON.stringify({ error: error.message, status: "error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});

// Fonction pour mettre à jour le statut d'un rendu dans la base de données
async function updateRenderStatus(renderId: string, status: string, videoUrl: string | null) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: renders, error: fetchError } = await supabase
        .from("slideshow_renders")
        .select("id")
        .eq("render_id", renderId)
        .limit(1);
      
      if (!fetchError && renders && renders.length > 0) {
        const updateData: any = {
          status: status,
          updated_at: new Date().toISOString(),
        };
        
        if (videoUrl) {
          updateData.video_url = videoUrl;
        }
        
        const { error } = await supabase
          .from("slideshow_renders")
          .update(updateData)
          .eq("render_id", renderId);
          
        if (error) {
          console.error("Error updating render status in database:", error);
        } else {
          console.log(`Updated render ${renderId} status to ${status} in database`);
        }
      } else if (fetchError) {
        console.error("Error fetching render from database:", fetchError);
      } else {
        console.log(`No render found with ID ${renderId} in database`);
      }
    }
  } catch (dbError) {
    console.error("Error updating database:", dbError);
  }
}

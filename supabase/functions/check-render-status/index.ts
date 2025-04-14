
// This file already exists, let's make sure it's properly implemented
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

    const response = await fetch(`https://api.shotstack.io/stage/render/${renderId}`, {
      method: "GET",
      headers: {
        "x-api-key": SHOTSTACK_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
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
              status: data.response.status === "done" ? "completed" : "error",
              updated_at: new Date().toISOString(),
            };
            
            if (data.response.url) {
              updateData.video_url = data.response.url;
            }
            
            await supabase
              .from("slideshow_renders")
              .update(updateData)
              .eq("render_id", renderId);
          }
        }
      } catch (dbError) {
        console.error("Error updating database:", dbError);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in check-render-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

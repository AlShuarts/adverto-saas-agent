import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    const {
      user_id,
      user_email,
      user_name,
      error_type,
      error_message,
      error_stack,
      page_url,
      action_context,
      browser_info,
      facebook_response,
      permissions_granted,
      permissions_denied,
      console_logs,
      additional_data,
    } = body;

    // Insert error report into database
    const { data, error } = await supabase.from("error_reports").insert({
      user_id,
      user_email,
      user_name,
      error_type,
      error_message,
      error_stack,
      page_url,
      action_context,
      browser_info,
      facebook_response,
      permissions_granted,
      permissions_denied,
      console_logs,
      additional_data,
      status: "new",
    }).select().single();

    if (error) {
      console.error("Error inserting error report:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`✅ Error report created: ${data.id} - Type: ${error_type}`);

    // Optional: Send webhook notification if configured
    const webhookUrl = Deno.env.get("ERROR_NOTIFICATION_WEBHOOK");
    if (webhookUrl) {
      try {
        const webhookPayload = {
          content: `🚨 **Nouvelle erreur signalée**\n\n` +
            `**Type:** ${error_type}\n` +
            `**Utilisateur:** ${user_name || user_email || "Anonyme"}\n` +
            `**Message:** ${error_message?.substring(0, 200)}...\n` +
            `**URL:** ${page_url}\n` +
            `**ID:** ${data.id}`,
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        });
        
        console.log("✅ Webhook notification sent");
      } catch (webhookError) {
        console.error("Failed to send webhook:", webhookError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

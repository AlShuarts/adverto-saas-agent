import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // Valider les champs requis
    if (!body.errorType || !body.errorMessage) {
      return new Response(
        JSON.stringify({ error: "errorType and errorMessage are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insérer le rapport d'erreur
    const { data, error } = await supabase
      .from('error_reports')
      .insert({
        user_id: body.userId || null,
        user_email: body.userEmail || null,
        user_name: body.userName || null,
        error_type: body.errorType,
        error_message: body.errorMessage?.substring(0, 5000),
        error_stack: body.errorStack?.substring(0, 10000),
        page_url: body.pageUrl?.substring(0, 2000),
        action_context: body.actionContext?.substring(0, 500),
        browser_info: body.browserInfo || null,
        facebook_response: body.facebookResponse || null,
        permissions_granted: body.permissionsGranted || null,
        permissions_denied: body.permissionsDenied || null,
        console_logs: body.consoleLogs || null,
        additional_data: body.additionalData || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Error report saved:", data.id);

    // Envoyer une notification webhook si configuré
    const webhookUrl = Deno.env.get("ERROR_NOTIFICATION_WEBHOOK");
    if (webhookUrl) {
      try {
        const webhookPayload = {
          text: `🚨 Nouvelle erreur signalée`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: [
                  `*Type:* ${body.errorType}`,
                  `*Utilisateur:* ${body.userName || 'Anonyme'} (${body.userEmail || 'N/A'})`,
                  `*Message:* ${body.errorMessage?.substring(0, 300)}`,
                  `*Page:* ${body.pageUrl || 'N/A'}`,
                  `*Contexte:* ${body.actionContext || 'N/A'}`,
                ].join('\n')
              }
            }
          ]
        };

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        console.log("Webhook notification sent");
      } catch (webhookError) {
        console.error("Webhook notification failed:", webhookError);
        // Ne pas bloquer si le webhook échoue
      }
    }

    return new Response(
      JSON.stringify({ success: true, reportId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

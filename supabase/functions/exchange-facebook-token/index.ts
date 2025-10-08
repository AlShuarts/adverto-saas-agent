import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shortLivedToken } = await req.json();

    if (!shortLivedToken) {
      throw new Error("Token court manquant");
    }

    const appId = "1595698614674424";
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');

    if (!appSecret) {
      throw new Error("Facebook App Secret non configuré");
    }

    console.log("Échange du token court contre un token longue durée...");

    const response = await fetch(
      `https://graph.facebook.com/v23.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${encodeURIComponent(shortLivedToken)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur lors de l'échange du token:", errorData);
      throw new Error(errorData.error?.message || "Échec de l'échange du token");
    }

    const data = await response.json();
    console.log("Token longue durée obtenu avec succès");

    return new Response(
      JSON.stringify({ 
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Erreur dans exchange-facebook-token:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

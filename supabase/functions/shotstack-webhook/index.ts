
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("🔹 Webhook Shotstack reçu");
    
    // Récupérer les données du webhook
    let webhook;
    try {
      webhook = await req.json();
      console.log('📌 Payload reçu:', JSON.stringify(webhook, null, 2));
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du payload:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Vérifier si le webhook contient un ID de rendu
    if (!webhook || !webhook.id) {
      console.error('❌ Payload invalide: pas d\'ID de rendu');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload: no render ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convertir le statut Shotstack en notre statut
    let status = webhook.status || 'unknown';
    if (webhook.status === 'done') {
      status = 'completed';
    } else if (webhook.status === 'failed') {
      status = 'error';
    }

    console.log(`🔍 Recherche du rendu avec ID: ${webhook.id}`);
    // Trouver l'enregistrement de rendu
    const { data: render, error: renderError } = await supabase
      .from('slideshow_renders')
      .select('*')
      .eq('render_id', webhook.id)
      .single();

    if (renderError) {
      console.error('❌ Rendu non trouvé:', webhook.id, renderError);
      return new Response(
        JSON.stringify({ error: 'Render not found', renderId: webhook.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`✅ Rendu trouvé, mise à jour du statut: ${status}`);
    console.log(`🎬 URL vidéo: ${webhook.url || 'Non disponible'}`);

    // Mettre à jour le statut du rendu
    const { error: updateError } = await supabase
      .from('slideshow_renders')
      .update({ 
        status: status,
        video_url: webhook.url || null,
        updated_at: new Date().toISOString()
      })
      .eq('render_id', webhook.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du rendu:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update render status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Si le rendu est terminé et qu'une URL de vidéo est disponible, mettre à jour le listing
    if (status === 'completed' && webhook.url) {
      console.log(`📝 Rendu terminé, mise à jour du listing ${render.listing_id} avec l'URL de la vidéo`);
      
      const { error: listingError } = await supabase
        .from('listings')
        .update({ 
          video_url: webhook.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', render.listing_id);

      if (listingError) {
        console.error('❌ Erreur lors de la mise à jour du listing:', listingError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

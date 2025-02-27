
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("🔍 Vérification du statut de rendu Shotstack");
    
    const { renderId } = await req.json();
    
    if (!renderId) {
      return new Response(
        JSON.stringify({ error: 'ID de rendu manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`🔹 Vérification du statut pour le rendu: ${renderId}`);
    
    // Vérifier le statut du rendu via l'API Shotstack
    const response = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
      method: 'GET',
      headers: {
        'x-api-key': Deno.env.get('SHOTSTACK_API_KEY') ?? '',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Erreur API Shotstack: ${response.status} ${response.statusText}`, errorData);
      return new Response(
        JSON.stringify({ error: `Erreur API Shotstack: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    const shotstackData = await response.json();
    console.log(`✅ Réponse Shotstack:`, JSON.stringify(shotstackData, null, 2));
    
    // Traiter le statut Shotstack
    if (!shotstackData.response) {
      return new Response(
        JSON.stringify({ error: 'Réponse Shotstack invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Mettre à jour notre base de données avec le nouveau statut
    let status = shotstackData.response.status || 'unknown';
    const videoUrl = shotstackData.response.url || null;
    
    if (status === 'done') {
      status = 'completed';
    } else if (status === 'failed') {
      status = 'error';
    } else if (status === 'rendering') {
      status = 'processing';
    }
    
    // Vérifier si nous avons déjà un enregistrement pour ce rendu
    const { data: render, error: renderError } = await supabase
      .from('slideshow_renders')
      .select('*')
      .eq('render_id', renderId)
      .single();
      
    if (renderError) {
      console.error('❌ Erreur lors de la récupération du rendu:', renderError);
      return new Response(
        JSON.stringify({ error: 'Rendu non trouvé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Mettre à jour le statut uniquement s'il a changé
    if (render.status !== status || (videoUrl && render.video_url !== videoUrl)) {
      console.log(`📝 Mise à jour du statut du rendu: ${render.status} -> ${status}`);
      
      const { error: updateError } = await supabase
        .from('slideshow_renders')
        .update({
          status: status,
          video_url: videoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('render_id', renderId);
        
      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour du statut:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la mise à jour du statut' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Si le rendu est terminé et qu'une URL est disponible, mettre à jour le listing
      if (status === 'completed' && videoUrl) {
        console.log(`🎬 Mise à jour du listing avec l'URL vidéo`);
        
        const { error: listingError } = await supabase
          .from('listings')
          .update({ 
            video_url: videoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', render.listing_id);
          
        if (listingError) {
          console.error('❌ Erreur lors de la mise à jour du listing:', listingError);
        }
      }
    } else {
      console.log(`ℹ️ Aucun changement de statut nécessaire: ${status}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: status, 
        videoUrl: videoUrl,
        message: 'Statut du rendu vérifié avec succès'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

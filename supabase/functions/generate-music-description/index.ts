import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listing } = await req.json();
    
    // Créer un prompt basé sur les caractéristiques de la propriété
    const prompt = `Suggérez un style musical approprié pour une vidéo immobilière présentant:
    - Type: ${listing.property_type || 'Non spécifié'}
    - Prix: ${listing.price ? `${listing.price}$` : 'Non spécifié'}
    - Chambres: ${listing.bedrooms || 'Non spécifié'}
    - Ville: ${listing.city || 'Non spécifié'}
    
    Répondez uniquement avec un de ces styles: calme, énergique, luxueux`;

    // Appeler l'API OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Vous êtes un expert en musique qui suggère des ambiances musicales pour des vidéos immobilières.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await openAIResponse.json();
    const style = data.choices[0].message.content.toLowerCase().trim();

    // Récupérer les musiques disponibles
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: musicFiles, error: storageError } = await supabase
      .storage
      .from('background-music')
      .list();

    if (storageError) {
      throw new Error(`Erreur lors de la récupération des musiques: ${storageError.message}`);
    }

    // Si aucune musique n'est trouvée, utiliser la première musique disponible
    let matchingMusic = musicFiles.find(file => file.name.toLowerCase().includes(style));
    if (!matchingMusic && musicFiles.length > 0) {
      console.log(`Aucune musique trouvée pour le style ${style}, utilisation de la première musique disponible`);
      matchingMusic = musicFiles[0];
    }
    
    if (!matchingMusic) {
      throw new Error('Aucune musique disponible dans le bucket');
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('background-music')
      .getPublicUrl(matchingMusic.name);

    return new Response(
      JSON.stringify({ 
        style,
        musicUrl: publicUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
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
    
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    // Calculer la durée totale nécessaire (5 secondes par image)
    const slideDuration = 5; // secondes par image
    const totalDuration = Math.ceil((listing.images?.length || 1) * slideDuration);
    
    console.log(`Generating music for ${listing.images?.length} images, duration: ${totalDuration} seconds`);

    // Créer un prompt pour la musique basé sur les caractéristiques de la propriété
    const prompt = `Create a professional, uplifting background music for a real estate video. 
    Property type: ${listing.property_type || 'residential'}
    Price: ${listing.price ? `$${listing.price}` : 'luxury'} 
    Style: modern and professional`;

    console.log("Generating music with prompt:", prompt);

    const output = await replicate.run(
      "meta/musicgen:7be0f12c54a8d033a0fbd14418c9af98962da9a86f5ff7811f9b3423a1f0b7d7",
      {
        input: {
          model_version: "large",
          prompt: prompt,
          duration: totalDuration
        }
      }
    );

    console.log("Generated music URL:", output);

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const musicResponse = await fetch(output);
    const musicBlob = await musicResponse.blob();
    
    const fileName = `music-${listing.id}-${Date.now()}.wav`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('background-music')
      .upload(fileName, musicBlob, {
        contentType: 'audio/wav',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('background-music')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ musicUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
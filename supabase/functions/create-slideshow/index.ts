import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { listingId } = await req.json();
    if (!listingId) {
      throw new Error('listingId is required');
    }

    console.log('Creating Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching listing:', listingId);
    const { data: listing, error: listingError } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      throw listingError;
    }
    if (!listing) {
      throw new Error('Listing not found');
    }
    if (!listing.images || listing.images.length === 0) {
      throw new Error('No images found for this listing');
    }

    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!HUGGING_FACE_TOKEN) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not set')
    }

    const hf = new HfInference(HUGGING_FACE_TOKEN)

    console.log('Creating video with Hugging Face...');
    const video = await hf.textToVideo({
      inputs: `Create a video slideshow from these images: ${listing.images.join(', ')}`,
      model: "damo-vilab/text-to-video-ms-1.7b",
    });

    if (!video) {
      throw new Error('No video generated from Hugging Face');
    }

    // Convert video blob to base64
    const arrayBuffer = await video.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const videoUrl = `data:video/mp4;base64,${base64}`;

    console.log('Video generated successfully');

    // Update listing with video URL
    const { error: updateError } = await supabaseClient
      .from('listings')
      .update({ video_url: videoUrl })
      .eq('id', listing.id);

    if (updateError) {
      console.error('Error updating listing:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ url: videoUrl }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in create-slideshow function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    );
  }
});
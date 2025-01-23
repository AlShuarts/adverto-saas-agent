import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting slideshow creation process...');
    const { listingId } = await req.json();
    
    if (!listingId) {
      console.error('No listingId provided');
      return new Response(
        JSON.stringify({ error: 'listingId is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching listing data for ID:', listingId);
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return new Response(
        JSON.stringify({ error: 'Listing not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const images = listing.images || [];
    if (images.length === 0) {
      console.error('No images found for listing:', listingId);
      return new Response(
        JSON.stringify({ error: 'No images found for this listing' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    console.log('Creating slideshow with Replicate...');
    const output = await replicate.run(
      "andreasjansson/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          images: images,
          frames_per_image: 30,
          output_format: "mp4",
          fps: 30,
          transition_frames: 10,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14,
          video_length: "input_length"
        }
      }
    );

    console.log('Slideshow created successfully:', output);

    // Update the listing with the video URL
    const { error: updateError } = await supabase
      .from('listings')
      .update({ video_url: output })
      .eq('id', listingId);

    if (updateError) {
      console.error('Error updating listing with video URL:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, url: output }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating slideshow:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
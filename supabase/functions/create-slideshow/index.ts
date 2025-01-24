import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders
    });
  }

  try {
    console.log('Starting slideshow creation process...');
    
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

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    })

    console.log('Creating slideshow with Replicate...');
    const output = await replicate.run(
      "andreasjansson/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          images: listing.images,
          frames_per_image: 30,
          fps: 30,
          sizing_strategy: "maintain_aspect_ratio",
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14,
          smooth_schedule: true
        }
      }
    );

    if (!output) {
      throw new Error('No output received from Replicate');
    }

    console.log('Video generated:', output);

    // Update listing with video URL
    const { error: updateError } = await supabaseClient
      .from('listings')
      .update({ video_url: output })
      .eq('id', listing.id);

    if (updateError) {
      console.error('Error updating listing:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ url: output }),
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
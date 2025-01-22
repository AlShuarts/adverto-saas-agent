import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils/cors.ts';
import { initFFmpeg, createSlideshow } from './utils/ffmpeg.ts';
import { uploadToStorage } from './utils/storage.ts';

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

    try {
      console.log('Initializing FFmpeg...');
      const ffmpeg = await initFFmpeg();

      console.log('Creating slideshow...');
      const videoBlob = await createSlideshow(ffmpeg, images, listing);

      console.log('Uploading slideshow...');
      const url = await uploadToStorage(videoBlob, listingId);

      console.log('Slideshow created successfully:', url);
      return new Response(
        JSON.stringify({ success: true, url }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (processingError) {
      console.error('Processing error:', processingError);
      return new Response(
        JSON.stringify({ error: 'Error processing slideshow', details: processingError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils/cors.ts';
import { initFFmpeg, createSlideshow } from './utils/ffmpeg.ts';
import { uploadToStorage } from './utils/storage.ts';

serve(async (req) => {
  // Log début de la requête
  console.log('Starting slideshow creation process...');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { listingId } = await req.json();
    console.log('Received request for listing:', listingId);
    
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

    console.log('Fetching listing data...');
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

    console.log('Found listing:', listing.title);
    const images = listing.images || [];
    console.log('Number of images:', images.length);

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
      console.log('FFmpeg initialized successfully');

      console.log('Starting slideshow creation...');
      const videoBlob = await createSlideshow(ffmpeg, images, listing);
      console.log('Slideshow created successfully, size:', videoBlob.size);

      console.log('Uploading slideshow to storage...');
      const url = await uploadToStorage(videoBlob, listingId);
      console.log('Slideshow uploaded successfully:', url);

      // Update the listing with the video URL
      const { error: updateError } = await supabase
        .from('listings')
        .update({ video_url: url })
        .eq('id', listingId);

      if (updateError) {
        console.error('Error updating listing with video URL:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error updating listing' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Process completed successfully');
      return new Response(
        JSON.stringify({ success: true, url }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (processingError) {
      console.error('Processing error:', processingError);
      return new Response(
        JSON.stringify({ 
          error: 'Error processing slideshow', 
          details: processingError.message,
          stack: processingError.stack 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message,
        stack: error.stack 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
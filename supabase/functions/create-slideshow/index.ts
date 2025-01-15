import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils/cors.ts';
import { initFFmpeg, createSlideshow } from './utils/ffmpeg.ts';
import { uploadToStorage } from './utils/storage.ts';
import { backgroundMusic } from './background-music.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Received request:', req.method);
    
    // Parse request body
    const { listingId } = await req.json();
    console.log('Received listingId:', listingId);
    
    if (!listingId) {
      console.error('No listingId provided');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'listingId is required' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching listing data...');
    
    // Fetch listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Listing not found',
          details: listingError 
        }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const images = listing.images || [];
    if (images.length === 0) {
      console.error('No images found for listing:', listingId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No images found for this listing' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing', images.length, 'images');

    try {
      console.log('Initializing FFmpeg...');
      const ffmpeg = await initFFmpeg();

      console.log('Creating slideshow...');
      const videoBlob = await createSlideshow(ffmpeg, images, listing);

      console.log('Uploading slideshow...');
      const url = await uploadToStorage(videoBlob, listingId);

      console.log('Slideshow created and uploaded successfully:', url);
      return new Response(
        JSON.stringify({ 
          success: true,
          url,
          message: 'Slideshow created successfully'
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (processingError) {
      console.error('Error during slideshow creation:', processingError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error during slideshow creation',
          details: processingError.message
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
        details: error.message
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
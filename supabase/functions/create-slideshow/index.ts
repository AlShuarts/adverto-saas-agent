import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { backgroundMusic } from './background-music.ts';
import { corsHeaders, handleCors, createResponse } from './utils/cors.ts';
import { initFFmpeg, createSlideshow } from './utils/ffmpeg.ts';
import { uploadToStorage } from './utils/storage.ts';

serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Parse request body
    const { listingId } = await req.json();
    if (!listingId) {
      return createResponse({ success: false, error: 'listingId is required' }, 400);
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return createResponse({ 
        success: false, 
        error: 'Listing not found',
        details: listingError 
      }, 404);
    }

    const images = listing.images || [];
    if (images.length === 0) {
      return createResponse({ 
        success: false, 
        error: 'No images found for this listing' 
      }, 400);
    }

    // Initialize FFmpeg
    const ffmpeg = await initFFmpeg();

    // Write background music
    const musicData = backgroundMusic.split('base64,')[1];
    await ffmpeg.writeFile('background.mp3', Uint8Array.from(atob(musicData), c => c.charCodeAt(0)));

    // Create slideshow
    const videoBlob = await createSlideshow(ffmpeg, images, listing);

    // Upload to storage
    const publicUrl = await uploadToStorage(videoBlob, listingId);

    return createResponse({ 
      success: true,
      url: publicUrl,
      message: 'Slideshow created successfully'
    });

  } catch (error) {
    console.error('Error in create-slideshow function:', error);
    return createResponse({
      success: false,
      error: error.message || 'An unexpected error occurred',
      details: error.toString()
    }, 500);
  }
});
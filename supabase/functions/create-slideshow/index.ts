import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { backgroundMusic } from './background-music.ts';
import { corsHeaders } from './utils/cors.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { listingId } = await req.json();
    
    if (!listingId) {
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

    console.log('Processing request for listing:', listingId);

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

    // Process images
    const processedImages = [];
    for (const imageUrl of images) {
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        processedImages.push(imageUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        // Continue with other images if one fails
      }
    }

    if (processedImages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to process any images' 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mock successful response for testing
    return new Response(
      JSON.stringify({ 
        success: true,
        url: processedImages[0], // Temporary: return first image URL as video URL
        message: 'Slideshow created successfully (mock response)'
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

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
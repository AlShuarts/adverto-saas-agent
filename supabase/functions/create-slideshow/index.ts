import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateSlideshow } from './utils/ffmpeg.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
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

    console.log('Generating video...');
    const videoBuffer = await generateSlideshow(listing.images);
    console.log('Video generated successfully');

    const fileName = `${listing.id}-${Date.now()}.mp4`;
    console.log('Uploading video:', fileName);
    
    const { error: storageError } = await supabaseClient
      .storage
      .from('listings-videos')
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: true
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      throw storageError;
    }

    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('listings-videos')
      .getPublicUrl(fileName);

    console.log('Updating listing with video URL:', publicUrl);
    const { error: updateError } = await supabaseClient
      .from('listings')
      .update({ video_url: publicUrl })
      .eq('id', listing.id);

    if (updateError) {
      console.error('Error updating listing:', updateError);
      throw updateError;
    }

    console.log('Process completed successfully');
    return new Response(
      JSON.stringify({ url: publicUrl }),
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
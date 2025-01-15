import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { fetchFile } from 'https://esm.sh/@ffmpeg/util@0.12.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { listingId } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch listing images
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('images')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      throw new Error('Listing not found');
    }

    const images = listing.images || [];
    if (images.length === 0) {
      throw new Error('No images found for this listing');
    }

    // Initialize FFmpeg
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Download and process each image
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const imageResponse = await fetch(imageUrl);
      const imageData = await imageResponse.arrayBuffer();
      await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageData));
    }

    // Create slideshow video
    await ffmpeg.exec([
      '-framerate', '1/3',  // Each image shows for 3 seconds
      '-i', 'image%d.jpg',
      '-c:v', 'libx264',
      '-r', '30',
      '-pix_fmt', 'yuv420p',
      'output.mp4'
    ]);

    // Read the output video
    const data = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([data], { type: 'video/mp4' });

    // Upload to Supabase Storage
    const fileName = `slideshow-${listingId}-${Date.now()}.mp4`;
    const { error: uploadError } = await supabase
      .storage
      .from('listings-images')
      .upload(fileName, videoBlob, {
        contentType: 'video/mp4',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('listings-images')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
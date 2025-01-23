import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';

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

    // Initialize FFmpeg
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Download and process each image
    for (let i = 0; i < images.length; i++) {
      const imageResponse = await fetch(images[i]);
      const imageBuffer = await imageResponse.arrayBuffer();
      await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageBuffer));
    }

    // Create a file list for FFmpeg
    const fileList = images.map((_, i) => `file 'image${i}.jpg'`).join('\n');
    await ffmpeg.writeFile('files.txt', fileList);

    // Create slideshow with transitions
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'files.txt',
      '-framerate', '1/3', // Each image shows for 3 seconds
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
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
      console.error('Error uploading video:', uploadError);
      throw new Error('Failed to upload video');
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('listings-images')
      .getPublicUrl(fileName);

    // Update the listing with the video URL
    const { error: updateError } = await supabase
      .from('listings')
      .update({ video_url: publicUrl })
      .eq('id', listingId);

    if (updateError) {
      console.error('Error updating listing with video URL:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, url: publicUrl }), 
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
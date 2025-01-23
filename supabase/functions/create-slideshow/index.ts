import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { fetchFile } from 'https://esm.sh/@ffmpeg/util@0.12.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, listingId } = await req.json();
    console.log('Received request with images:', images);

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error('No images provided');
    }

    if (!listingId) {
      throw new Error('No listing ID provided');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Initialize FFmpeg
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Download and process each image
    console.log('Processing images...');
    for (let i = 0; i < images.length; i++) {
      console.log(`Downloading image ${i + 1}/${images.length}`);
      const imageData = await fetchFile(images[i]);
      await ffmpeg.writeFile(`image${i}.jpg`, imageData);
    }

    // Create a file list for FFmpeg
    const fileList = images.map((_, i) => `file 'image${i}.jpg'`).join('\n');
    await ffmpeg.writeFile('files.txt', fileList);

    console.log('Creating slideshow...');
    // Create slideshow with transitions
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'files.txt',
      '-framerate', '1/3',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p',
      '-movflags', '+faststart',
      'output.mp4'
    ]);

    console.log('Reading output video...');
    const data = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });

    // Upload to Supabase Storage
    const fileName = `slideshow-${listingId}-${Date.now()}.mp4`;
    console.log('Uploading to Supabase Storage:', fileName);
    
    const { error: uploadError } = await supabase
      .storage
      .from('listings-images')
      .upload(fileName, videoBlob, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading video:', uploadError);
      throw new Error('Failed to upload video');
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('listings-images')
      .getPublicUrl(fileName);

    console.log('Video uploaded successfully:', publicUrl);

    // Update the listing with the video URL
    const { error: updateError } = await supabase
      .from('listings')
      .update({ video_url: publicUrl })
      .eq('id', listingId);

    if (updateError) {
      throw updateError;
    }

    console.log('Listing updated successfully');

    return new Response(
      JSON.stringify({ success: true, url: publicUrl }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-slideshow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
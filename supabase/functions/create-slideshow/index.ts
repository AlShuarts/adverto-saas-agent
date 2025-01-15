import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { fetchFile } from 'https://esm.sh/@ffmpeg/util@0.12.1';
import { backgroundMusic } from './background-music.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    console.log('Starting slideshow creation...');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request body');
    }
    
    const { listingId } = body;
    if (!listingId) {
      throw new Error('listingId is required');
    }
    
    console.log('Listing ID:', listingId);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch listing details
    console.log('Fetching listing details...');
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError) {
      console.error('Error fetching listing:', listingError);
      throw new Error('Listing not found');
    }

    console.log('Listing found:', listing);

    const images = listing.images || [];
    if (images.length === 0) {
      throw new Error('No images found for this listing');
    }

    console.log('Number of images:', images.length);

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...');
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Write background music to file
    console.log('Writing background music...');
    const musicData = backgroundMusic.split('base64,')[1];
    await ffmpeg.writeFile('background.mp3', Uint8Array.from(atob(musicData), c => c.charCodeAt(0)));
    console.log('Background music written successfully');

    // Download and process each image
    console.log('Processing images...');
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      console.log(`Downloading image ${i + 1}/${images.length}: ${imageUrl}`);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image ${i + 1}: ${imageResponse.statusText}`);
      }
      const imageData = await imageResponse.arrayBuffer();
      await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageData));
      console.log(`Image ${i + 1} processed successfully`);
    }

    // Create text file with listing information
    console.log('Creating text overlay...');
    const textContent = `${listing.title}\n${listing.price ? formatPrice(listing.price) : "Prix sur demande"}\n${listing.bedrooms || 0} chambre(s) | ${listing.bathrooms || 0} salle(s) de bain\n${[listing.address, listing.city].filter(Boolean).join(", ")}`;
    await ffmpeg.writeFile('info.txt', textContent);
    console.log('Text overlay created successfully');

    // Create slideshow video with text overlay and background music
    console.log('Generating video...');
    await ffmpeg.exec([
      '-framerate', '1/3',
      '-i', 'image%d.jpg',
      '-i', 'background.mp3',
      '-filter_complex',
      '[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:textfile=info.txt:fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50[v]',
      '-map', '[v]',
      '-map', '1:a',
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-shortest',
      '-r', '30',
      '-pix_fmt', 'yuv420p',
      'output.mp4'
    ]);
    console.log('Video generated successfully');

    // Read the output video
    console.log('Reading output video...');
    const outputData = await ffmpeg.readFile('output.mp4');
    if (!outputData) {
      throw new Error('Failed to read output video');
    }
    const videoBlob = new Blob([outputData], { type: 'video/mp4' });
    console.log('Video read successfully, size:', videoBlob.size);

    // Upload to Supabase Storage
    console.log('Uploading to Supabase Storage...');
    const fileName = `slideshow-${listingId}-${Date.now()}.mp4`;
    const { error: uploadError } = await supabase
      .storage
      .from('listings-images')
      .upload(fileName, videoBlob, {
        contentType: 'video/mp4',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Video uploaded successfully');

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('listings-images')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: publicUrl,
        message: 'Slideshow created successfully'
      }),
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
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Utility function to format price
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
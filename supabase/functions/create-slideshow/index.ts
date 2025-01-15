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

    // Fetch listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
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

    // Write background music to file
    const musicData = backgroundMusic.split('base64,')[1];
    await ffmpeg.writeFile('background.mp3', Uint8Array.from(atob(musicData), c => c.charCodeAt(0)));

    // Download and process each image
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const imageResponse = await fetch(imageUrl);
      const imageData = await imageResponse.arrayBuffer();
      await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageData));
    }

    // Create text file with listing information
    const textContent = `${listing.title}\n${listing.price ? formatPrice(listing.price) : "Prix sur demande"}\n${listing.bedrooms || 0} chambre(s) | ${listing.bathrooms || 0} salle(s) de bain\n${[listing.address, listing.city].filter(Boolean).join(", ")}`;
    await ffmpeg.writeFile('info.txt', textContent);

    // Create slideshow video with text overlay and background music
    await ffmpeg.exec([
      '-framerate', '1/3',  // Each image shows for 3 seconds
      '-i', 'image%d.jpg',
      '-i', 'background.mp3',
      '-filter_complex', `
        [0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,
        drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:
        textfile=info.txt:fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:
        boxborderw=5:x=(w-text_w)/2:y=h-text_h-50[v]
      `,
      '-map', '[v]',
      '-map', '1:a',
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-shortest',
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

// Utility function to format price
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
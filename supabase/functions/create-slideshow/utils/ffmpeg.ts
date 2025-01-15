import { createFFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { backgroundMusic } from '../background-music.ts';

export const initFFmpeg = async () => {
  console.log('Initializing FFmpeg...');
  const ffmpeg = createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js'
  });
  await ffmpeg.load();
  console.log('FFmpeg loaded successfully');
  return ffmpeg;
};

export const createSlideshow = async (ffmpeg, images, listing) => {
  console.log('Starting slideshow creation...');
  
  // Process images
  for (let i = 0; i < images.length; i++) {
    const imageUrl = images[i];
    console.log(`Downloading image ${i + 1}/${images.length}: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image ${i + 1}: ${imageResponse.statusText}`);
    }
    const imageData = await imageResponse.arrayBuffer();
    await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageData));
  }

  // Create text overlay
  const textContent = `${listing.title}\n${listing.price ? formatPrice(listing.price) : "Prix sur demande"}\n${listing.bedrooms || 0} chambre(s) | ${listing.bathrooms || 0} salle(s) de bain\n${[listing.address, listing.city].filter(Boolean).join(", ")}`;
  await ffmpeg.writeFile('info.txt', textContent);

  // Write background music
  await ffmpeg.writeFile('background.mp3', backgroundMusic);

  // Generate video
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

  const outputData = await ffmpeg.readFile('output.mp4');
  if (!outputData) {
    throw new Error('Failed to read output video');
  }
  
  return new Blob([outputData], { type: 'video/mp4' });
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
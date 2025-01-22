import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { backgroundMusic } from '../background-music.ts';

export const initFFmpeg = async () => {
  console.log('Initializing FFmpeg...');
  const ffmpeg = new FFmpeg({
    log: true,
    mainName: 'main',
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
    workerPath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.worker.js'
  });

  try {
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw error;
  }
};

export const createSlideshow = async (ffmpeg: FFmpeg, images: string[], listing: any) => {
  console.log('Starting slideshow creation with', images.length, 'images');
  
  // Limit number of images to prevent resource exhaustion
  const maxImages = 5;
  const processedImages = images.slice(0, maxImages);
  
  // Process images sequentially with lower quality
  for (let i = 0; i < processedImages.length; i++) {
    const imageUrl = processedImages[i];
    console.log(`Processing image ${i + 1}/${processedImages.length}: ${imageUrl}`);
    
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image ${i + 1}: ${imageResponse.statusText}`);
      }
      const imageData = await imageResponse.arrayBuffer();
      await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageData));
      
      // Optimize each image before processing
      await ffmpeg.exec([
        '-i', `image${i}.jpg`,
        '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
        '-quality', '80',
        `optimized${i}.jpg`
      ]);
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      throw error;
    }
  }

  // Create text overlay with minimal formatting
  const textContent = `${listing.title}\n${listing.price ? formatPrice(listing.price) : "Prix sur demande"}`;
  await ffmpeg.writeFile('info.txt', textContent);

  // Write background music
  await ffmpeg.writeFile('background.mp3', backgroundMusic);

  // Generate video with optimized settings
  const command = [
    '-framerate', '1/3',
    '-pattern_type', 'sequence',
    '-i', 'optimized%d.jpg',
    '-i', 'background.mp3',
    '-filter_complex',
    '[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:textfile=info.txt:fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=h-text_h-50[v]',
    '-map', '[v]',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '30',
    '-c:a', 'aac',
    '-shortest',
    '-movflags', '+faststart',
    'output.mp4'
  ];

  console.log('Executing FFmpeg command:', command.join(' '));
  await ffmpeg.exec(command);

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
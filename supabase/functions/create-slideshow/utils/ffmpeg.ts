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
  
  // Process images sequentially
  for (let i = 0; i < images.length; i++) {
    const imageUrl = images[i];
    console.log(`Processing image ${i + 1}/${images.length}: ${imageUrl}`);
    
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image ${i + 1}: ${imageResponse.statusText}`);
      }
      const imageData = await imageResponse.arrayBuffer();
      await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageData));
      
      // Optimize each image
      await ffmpeg.exec([
        '-i', `image${i}.jpg`,
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
        '-quality', '90',
        `optimized${i}.jpg`
      ]);
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      throw error;
    }
  }

  // Write background music
  await ffmpeg.writeFile('background.mp3', backgroundMusic);

  // Generate video with transitions
  const command = [
    '-framerate', '1/3',  // Each image shows for 3 seconds
    '-pattern_type', 'sequence',
    '-i', 'optimized%d.jpg',
    '-i', 'background.mp3',
    '-filter_complex',
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v];[v]fade=t=in:st=0:d=1,fade=t=out:st=2:d=1[fv]`,
    '-map', '[fv]',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-preset', 'medium',  // Better quality preset
    '-crf', '23',  // Better quality (lower value = higher quality, 23 is default)
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
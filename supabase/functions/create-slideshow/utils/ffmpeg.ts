import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { backgroundMusic } from '../background-music.ts';

export const initFFmpeg = async () => {
  console.log('Initializing FFmpeg...');
  const ffmpeg = new FFmpeg({
    log: true,
    mainName: 'main',
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
  });

  try {
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw new Error(`Failed to initialize FFmpeg: ${error.message}`);
  }
};

export const createSlideshow = async (ffmpeg: FFmpeg, images: string[], listing: any) => {
  console.log('Starting slideshow creation with', images.length, 'images');
  
  // Process only first image for testing
  const processedImages = [images[0]];
  console.log(`Processing ${processedImages.length} images out of ${images.length} total`);
  
  try {
    // Process images sequentially
    for (let i = 0; i < processedImages.length; i++) {
      const imageUrl = processedImages[i];
      console.log(`Processing image ${i + 1}/${processedImages.length}: ${imageUrl}`);
      
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image ${i + 1}: ${imageResponse.statusText}`);
      }
      const imageData = await imageResponse.arrayBuffer();
      await ffmpeg.writeFile(`image${i}.jpg`, new Uint8Array(imageData));
    }

    // Write background music
    await ffmpeg.writeFile('background.mp3', backgroundMusic);

    // Generate video with minimal settings for testing
    const command = [
      '-loop', '1',
      '-t', '3',
      '-i', 'image0.jpg',
      '-i', 'background.mp3',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      'output.mp4'
    ];

    console.log('Executing FFmpeg command:', command.join(' '));
    await ffmpeg.exec(command);

    const outputData = await ffmpeg.readFile('output.mp4');
    if (!outputData) {
      throw new Error('Failed to read output video');
    }
    
    return new Blob([outputData], { type: 'video/mp4' });
  } catch (error) {
    console.error('Error in createSlideshow:', error);
    throw error;
  }
};
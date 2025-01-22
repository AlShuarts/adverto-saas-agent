import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.0';

export const initFFmpeg = async () => {
  console.log('Initializing FFmpeg...');
  const ffmpeg = new FFmpeg();
  
  try {
    console.log('Loading FFmpeg...');
    await ffmpeg.load({
      log: true,
      coreURL: await toBlobURL(
        `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js`,
        'text/javascript'
      ),
      wasmURL: await toBlobURL(
        `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm`,
        'application/wasm'
      )
    });
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw new Error(`Failed to initialize FFmpeg: ${error.message}`);
  }
};

export const createSlideshow = async (ffmpeg: FFmpeg, images: string[], listing: any) => {
  console.log('Starting slideshow creation with first image...');
  
  try {
    // Fetch only the first image
    const imageUrl = images[0];
    console.log('Processing image:', imageUrl);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const imageData = await imageResponse.arrayBuffer();
    console.log('Image data fetched, size:', imageData.byteLength);
    
    // Write input file
    await ffmpeg.writeFile('input.jpg', new Uint8Array(imageData));
    console.log('Image written to FFmpeg');

    // Simple command to create a static video
    const command = [
      '-i', 'input.jpg',
      '-t', '3',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      'output.mp4'
    ];

    console.log('Executing FFmpeg command:', command.join(' '));
    await ffmpeg.exec(command);
    console.log('FFmpeg command executed');

    const data = await ffmpeg.readFile('output.mp4');
    console.log('Output video read, size:', data.byteLength);
    
    return new Blob([data], { type: 'video/mp4' });
  } catch (error) {
    console.error('Error in createSlideshow:', error);
    throw error;
  }
};
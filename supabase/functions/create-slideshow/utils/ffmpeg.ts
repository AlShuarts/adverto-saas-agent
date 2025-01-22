import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { backgroundMusic } from '../background-music.ts';

export const initFFmpeg = async () => {
  console.log('Initializing FFmpeg...');
  const ffmpeg = new FFmpeg();
  
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
  console.log('Starting slideshow creation...');
  
  try {
    // Only process the first image
    const imageUrl = images[0];
    console.log('Processing image:', imageUrl);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageData = await imageResponse.arrayBuffer();
    await ffmpeg.writeFile('input.jpg', new Uint8Array(imageData));
    
    // Write background music
    await ffmpeg.writeFile('background.mp3', backgroundMusic);

    // Most basic possible command to create a video
    const command = [
      '-loop', '1',
      '-i', 'input.jpg',
      '-t', '5',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
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
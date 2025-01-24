import { createFFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.11.0';

export const generateSlideshow = async (images: string[]) => {
  console.log('Starting slideshow generation with', images.length, 'images');
  
  try {
    const ffmpeg = createFFmpeg({ 
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
    });
    
    console.log('Initializing FFmpeg...');
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Process images sequentially with optimized settings and better error handling
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      console.log(`Processing image ${i + 1}/${images.length}: ${imageUrl}`);
      
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image ${i + 1}: ${response.statusText}`);
        }
        const imageData = await response.arrayBuffer();
        ffmpeg.FS('writeFile', `image${i}.jpg`, new Uint8Array(imageData));
        console.log(`Image ${i + 1} downloaded and written to FFmpeg`);
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        throw new Error(`Failed to process image ${i + 1}: ${error.message}`);
      }
    }

    // Generate video with optimized settings for faster processing
    const command = [
      '-framerate', '1/2',
      '-i', 'image%d.jpg',
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      'output.mp4'
    ];

    console.log('Executing FFmpeg command:', command.join(' '));
    await ffmpeg.run(...command);
    console.log('FFmpeg command executed successfully');

    const data = ffmpeg.FS('readFile', 'output.mp4');
    console.log('Video file read successfully, size:', data.length);
    
    // Clean up
    ffmpeg.FS('unlink', 'output.mp4');
    for (let i = 0; i < images.length; i++) {
      ffmpeg.FS('unlink', `image${i}.jpg`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in generateSlideshow:', error);
    throw error;
  }
};
import { createFFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.11.0';

export const generateSlideshow = async (images: string[]) => {
  console.log('Starting slideshow generation with', images.length, 'images');
  
  try {
    const ffmpeg = createFFmpeg({ 
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
    });
    
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Process images sequentially with optimized settings
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      console.log(`Processing image ${i + 1}/${images.length}: ${imageUrl}`);
      
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image ${i + 1}: ${imageResponse.statusText}`);
        }
        const imageData = await imageResponse.arrayBuffer();
        ffmpeg.FS('writeFile', `image${i}.jpg`, new Uint8Array(imageData));
        console.log(`Image ${i + 1} downloaded and written to FFmpeg`);
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        throw error;
      }
    }

    // Generate video with optimized settings for faster processing
    const command = [
      '-framerate', '1/2',  // Faster processing: 2 seconds per image instead of 3
      '-i', 'image%d.jpg',
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',  // Lower resolution for faster processing
      '-c:v', 'libx264',
      '-preset', 'ultrafast',  // Fastest encoding
      '-crf', '28',  // Slightly lower quality for faster processing
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
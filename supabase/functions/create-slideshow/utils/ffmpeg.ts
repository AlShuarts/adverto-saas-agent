import { createFFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.11.0';

export const generateSlideshow = async (images: string[]) => {
  console.log('Starting slideshow generation with', images.length, 'images');
  
  try {
    const ffmpeg = createFFmpeg({ 
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
    });
    
    console.log('Loading FFmpeg...');
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Write images to FFmpeg virtual filesystem
    for (let i = 0; i < images.length; i++) {
      console.log(`Processing image ${i + 1}/${images.length}`);
      const response = await fetch(images[i]);
      const buffer = await response.arrayBuffer();
      ffmpeg.FS('writeFile', `image${i}.jpg`, new Uint8Array(buffer));
    }

    // Simple slideshow command
    console.log('Generating slideshow...');
    await ffmpeg.run(
      '-framerate', '1/3',
      '-pattern_type', 'sequence',
      '-i', 'image%d.jpg',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      'output.mp4'
    );

    // Read the output file
    const data = ffmpeg.FS('readFile', 'output.mp4');
    console.log('Video generated successfully');

    // Cleanup
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
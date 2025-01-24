import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.0';

export const initFFmpeg = async () => {
  console.log('Initializing FFmpeg...');
  const ffmpeg = new FFmpeg();
  
  console.log('Loading FFmpeg...');
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  console.log('FFmpeg loaded successfully');
  return ffmpeg;
};

export const generateSlideshow = async (images: string[]) => {
  console.log('Starting slideshow generation with', images.length, 'images');
  const ffmpeg = await initFFmpeg();
  
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
      console.log(`Image ${i + 1} downloaded and written to FFmpeg`);
      
      // Optimize each image
      await ffmpeg.exec([
        '-i', `image${i}.jpg`,
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
        '-quality', '90',
        `optimized${i}.jpg`
      ]);
      console.log(`Image ${i + 1} optimized`);
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error);
      throw error;
    }
  }

  // Generate video with transitions
  const command = [
    '-framerate', '1/3',  // Each image shows for 3 seconds
    '-pattern_type', 'sequence',
    '-i', 'optimized%d.jpg',
    '-filter_complex',
    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v];[v]fade=t=in:st=0:d=1,fade=t=out:st=2:d=1[fv]`,
    '-map', '[fv]',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-movflags', '+faststart',
    'output.mp4'
  ];

  console.log('Executing FFmpeg command:', command.join(' '));
  await ffmpeg.exec(command);
  console.log('FFmpeg command executed successfully');

  const outputData = await ffmpeg.readFile('output.mp4');
  if (!outputData) {
    throw new Error('Failed to read output video');
  }
  console.log('Video file read successfully, size:', outputData.length);
  
  return new Uint8Array(outputData.buffer);
};
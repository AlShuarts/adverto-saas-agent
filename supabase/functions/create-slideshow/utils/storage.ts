import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const uploadToStorage = async (videoBlob: Blob, listingId: string): Promise<string> => {
  console.log('Starting video upload to storage...');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const filename = `slideshow-${listingId}.mp4`;
  console.log('Uploading file:', filename);

  const { data, error } = await supabase.storage
    .from('listings-images')
    .upload(filename, videoBlob, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }

  console.log('Upload successful:', data.path);

  const { data: { publicUrl } } = supabase.storage
    .from('listings-images')
    .getPublicUrl(filename);

  console.log('Public URL generated:', publicUrl);
  return publicUrl;
};
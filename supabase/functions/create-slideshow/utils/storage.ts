import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const uploadToStorage = async (videoBlob: Blob, listingId: string) => {
  console.log('Uploading to Supabase Storage...');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const fileName = `slideshow-${listingId}-${Date.now()}.mp4`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('listings-images')
    .upload(fileName, videoBlob, {
      contentType: 'video/mp4',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to upload video');
  }

  const { data: { publicUrl } } = supabase
    .storage
    .from('listings-images')
    .getPublicUrl(fileName);

  return publicUrl;
};
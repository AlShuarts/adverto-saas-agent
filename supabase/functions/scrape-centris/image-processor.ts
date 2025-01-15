import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ImageProcessingResult } from './types.ts';

export class ImageProcessor {
  private supabase;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  private cleanImageUrl(url: string): string | null {
    if (!url) return null;
    const baseUrl = url.split('?')[0];
    if (!baseUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return null;
    if (baseUrl.includes('thumbnail') || baseUrl.includes('small')) return null;
    return baseUrl;
  }

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Processing image:', imageUrl);
      const cleanUrl = this.cleanImageUrl(imageUrl);
      
      if (!cleanUrl) {
        return { processedUrl: null, error: 'Invalid image URL' };
      }

      const imageResponse = await fetch(cleanUrl);
      if (!imageResponse.ok) {
        return { processedUrl: null, error: 'Failed to download image' };
      }

      const imageBlob = await imageResponse.blob();
      const fileExt = cleanUrl.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, imageBlob, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (uploadError) {
        console.error('Failed to upload image:', uploadError);
        return { processedUrl: null, error: 'Upload failed' };
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully:', publicUrl);
      return { processedUrl: publicUrl };
    } catch (error) {
      console.error('Error processing image:', error);
      return { processedUrl: null, error: error.message };
    }
  }
}
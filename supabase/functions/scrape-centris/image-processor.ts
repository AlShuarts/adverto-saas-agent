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

    // Remove query parameters but keep the base URL
    const baseUrl = url.split('?')[0];
    console.log('Cleaned URL:', baseUrl);

    // Check if it's a valid image URL
    if (!baseUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      console.log('Invalid image format:', baseUrl);
      return null;
    }

    // Skip thumbnail images
    if (baseUrl.includes('thumbnail') || baseUrl.includes('small')) {
      console.log('Skipping thumbnail:', baseUrl);
      return null;
    }

    return baseUrl;
  }

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Starting to process image:', imageUrl);
      const cleanUrl = this.cleanImageUrl(imageUrl);
      
      if (!cleanUrl) {
        console.log('Invalid image URL:', imageUrl);
        return { processedUrl: null, error: 'Invalid image URL' };
      }

      console.log('Fetching image from:', cleanUrl);
      const imageResponse = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!imageResponse.ok) {
        console.error('Failed to download image:', imageResponse.status, imageResponse.statusText);
        return { processedUrl: null, error: 'Failed to download image' };
      }

      const contentType = imageResponse.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!contentType || !contentType.startsWith('image/')) {
        console.error('Invalid content type:', contentType);
        return { processedUrl: null, error: 'Invalid content type' };
      }

      const imageBlob = await imageResponse.blob();
      console.log('Image blob size:', imageBlob.size);

      const fileExt = cleanUrl.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      console.log('Generated filename:', fileName);

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, imageBlob, {
          contentType: contentType,
          upsert: false
        });

      if (uploadError) {
        console.error('Failed to upload image:', uploadError);
        return { processedUrl: null, error: 'Upload failed: ' + uploadError.message };
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl } } = this.supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);
      return { processedUrl: publicUrl };
    } catch (error) {
      console.error('Error processing image:', error);
      return { processedUrl: null, error: error.message };
    }
  }
}

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

  private isValidImageUrl(url: string): boolean {
    return url.includes('mspublic.centris.ca/media.ashx') && url.includes('id=');
  }

  private cleanImageUrl(url: string): string {
    // Demander une image de haute qualité (2048x1536)
    return url.includes('&w=') ? url : `${url}&w=2048&h=1536&sm=c`;
  }

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Traitement de l\'image:', imageUrl);

      if (!this.isValidImageUrl(imageUrl)) {
        return { processedUrl: null, error: 'URL invalide' };
      }

      const cleanedUrl = this.cleanImageUrl(imageUrl);
      console.log('URL nettoyée:', cleanedUrl);

      const response = await fetch(cleanedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*',
          'Referer': 'https://www.centris.ca/',
        }
      });

      if (!response.ok) {
        console.error('Erreur de téléchargement:', response.status, response.statusText);
        return { processedUrl: null, error: `Erreur HTTP: ${response.status}` };
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        console.error('Image vide reçue');
        return { processedUrl: null, error: 'Image vide' };
      }

      console.log('Taille de l\'image téléchargée:', blob.size, 'bytes');
      console.log('Type de l\'image:', blob.type);

      const fileName = `${crypto.randomUUID()}.jpg`;
      console.log('Nom du fichier généré:', fileName);

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, blob, {
          contentType: blob.type,
          duplex: 'half',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur d\'upload:', uploadError);
        return { processedUrl: null, error: 'Erreur d\'upload' };
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);

      console.log('Image traitée avec succès:', publicUrl);
      return { processedUrl: publicUrl };

    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      return { processedUrl: null, error: error.message };
    }
  }
}
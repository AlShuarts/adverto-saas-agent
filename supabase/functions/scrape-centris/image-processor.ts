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
    try {
      const originalUrl = new URL(url);
      const params = new URLSearchParams(originalUrl.search);
      
      // Garder uniquement l'ID de l'image
      const imageId = params.get('id');
      
      // Construire une nouvelle URL avec les paramètres originaux
      const newParams = new URLSearchParams();
      newParams.set('id', imageId || '');
      newParams.set('t', 'photo');
      
      // Garder les dimensions originales si présentes
      if (params.has('w') && params.has('h')) {
        newParams.set('w', params.get('w') || '1024');
        newParams.set('h', params.get('h') || '768');
      } else {
        newParams.set('w', '1024');
        newParams.set('h', '768');
      }

      const finalUrl = `https://mspublic.centris.ca/media.ashx?${newParams.toString()}`;
      console.log('URL nettoyée:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'URL:', error);
      return url;
    }
  }

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Traitement de l\'image:', imageUrl);

      if (!this.isValidImageUrl(imageUrl)) {
        console.error('URL invalide:', imageUrl);
        return { processedUrl: null, error: 'URL invalide' };
      }

      const cleanedUrl = this.cleanImageUrl(imageUrl);
      console.log('URL nettoyée:', cleanedUrl);

      const response = await fetch(cleanedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.centris.ca/',
          'Origin': 'https://www.centris.ca',
          'Sec-Fetch-Site': 'same-site',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Dest': 'image',
          'Connection': 'keep-alive'
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

      console.log('Informations sur l\'image:');
      console.log('- Taille:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('- Type:', blob.type);

      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      console.log('Nom du fichier:', fileName);

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, blob, {
          contentType: blob.type,
          cacheControl: '31536000',
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
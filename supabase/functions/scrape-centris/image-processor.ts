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

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Début du traitement de l\'image:', imageUrl);

      // Headers optimisés pour le téléchargement depuis Centris
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.centris.ca/',
        'Origin': 'https://www.centris.ca',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site'
      };

      // Téléchargement de l'image avec timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const imageResponse = await fetch(imageUrl, { 
        headers,
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));

      if (!imageResponse.ok) {
        throw new Error(`Erreur HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
      }

      const contentType = imageResponse.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        throw new Error(`Type de contenu invalide: ${contentType}`);
      }

      const imageBlob = await imageResponse.blob();
      if (imageBlob.size === 0) {
        throw new Error('Image vide reçue');
      }

      // Génération d'un nom de fichier unique
      const fileExt = contentType.split('/')[1] || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload vers Supabase avec retry
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from('listings-images')
            .upload(fileName, imageBlob, {
              contentType: contentType,
              cacheControl: '31536000',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = this.supabase.storage
            .from('listings-images')
            .getPublicUrl(fileName);

          console.log('Image uploadée avec succès:', publicUrl);
          return { processedUrl: publicUrl };
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      throw new Error('Nombre maximum de tentatives atteint');

    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      return { 
        processedUrl: null, 
        error: error.message 
      };
    }
  }
}
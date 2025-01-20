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
      
      // Garder l'ID et le type de l'image originale
      const imageId = params.get('id');
      const imageType = params.get('t') || 'pi';
      
      // Construire une nouvelle URL avec les paramètres optimaux
      const newParams = new URLSearchParams();
      newParams.set('id', imageId || '');
      newParams.set('t', imageType);
      
      // Ne pas modifier les dimensions si elles sont déjà présentes
      if (!params.has('w') && !params.has('h')) {
        newParams.set('w', '1024');
        newParams.set('h', '768');
      } else {
        newParams.set('w', params.get('w') || '1024');
        newParams.set('h', params.get('h') || '768');
      }
      
      // Ajouter les paramètres de qualité si absents
      if (!params.has('sm')) newParams.set('sm', 'c');
      if (!params.has('q')) newParams.set('q', '80');

      return `https://mspublic.centris.ca/media.ashx?${newParams.toString()}`;
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'URL:', error);
      return url; // Retourner l'URL originale en cas d'erreur
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
          'Accept': 'image/webp,image/jpeg,image/png,image/*',
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
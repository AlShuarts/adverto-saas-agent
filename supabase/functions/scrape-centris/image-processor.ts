import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ImageProcessingResult } from './types.ts';

export class ImageProcessor {
  private supabase;
  private seenUrls: Set<string>;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    this.seenUrls = new Set<string>();
  }

  private isValidImageUrl(url: string): boolean {
    return url.includes('mspublic.centris.ca/media.ashx');
  }

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Début du traitement de l\'image:', imageUrl);

      if (!this.isValidImageUrl(imageUrl)) {
        console.error('URL invalide:', imageUrl);
        return { processedUrl: null, error: 'URL invalide' };
      }

      // Télécharger l'image depuis Centris
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.centris.ca/',
          'Origin': 'https://www.centris.ca'
        }
      });

      if (!imageResponse.ok) {
        console.error('Erreur lors du téléchargement de l\'image:', imageResponse.status, imageResponse.statusText);
        return { processedUrl: null, error: `Erreur HTTP: ${imageResponse.status}` };
      }

      const imageBlob = await imageResponse.blob();
      console.log('Image téléchargée, taille:', imageBlob.size, 'bytes');

      if (imageBlob.size === 0) {
        console.error('Image vide reçue');
        return { processedUrl: null, error: 'Image vide' };
      }

      // Générer un nom de fichier unique
      const fileExt = imageBlob.type.split('/')[1] || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      console.log('Nom de fichier généré:', fileName);

      // Uploader l'image dans le bucket Supabase
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, imageBlob, {
          contentType: imageBlob.type,
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur lors de l\'upload vers Supabase:', uploadError);
        return { processedUrl: null, error: 'Erreur d\'upload' };
      }

      console.log('Image uploadée avec succès:', uploadData);

      // Obtenir l'URL publique
      const { data: { publicUrl } } = this.supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);

      console.log('URL publique générée:', publicUrl);
      return { processedUrl: publicUrl };

    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      return { processedUrl: null, error: error.message };
    }
  }
}
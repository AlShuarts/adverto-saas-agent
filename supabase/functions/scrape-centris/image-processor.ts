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
    // Assouplir la validation pour accepter plus de formats d'URLs
    return url.includes('centris.ca') && (
      url.includes('media.ashx') || 
      url.includes('photos') || 
      url.includes('images')
    );
  }

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Début du traitement de l\'image:', imageUrl);

      if (!this.isValidImageUrl(imageUrl)) {
        console.error('URL invalide:', imageUrl);
        return { processedUrl: null, error: 'URL invalide' };
      }

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

      // Téléchargement de l'image avec gestion des erreurs HTTP et timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const imageResponse = await fetch(imageUrl, { 
        headers,
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));

      if (!imageResponse.ok) {
        console.error('Erreur HTTP lors du téléchargement:', {
          status: imageResponse.status,
          statusText: imageResponse.statusText,
          url: imageResponse.url
        });
        return { 
          processedUrl: null, 
          error: `Erreur HTTP: ${imageResponse.status} ${imageResponse.statusText}` 
        };
      }

      const contentType = imageResponse.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        console.error('Type de contenu invalide:', contentType);
        return { 
          processedUrl: null, 
          error: `Type de contenu invalide: ${contentType}` 
        };
      }

      const imageBlob = await imageResponse.blob();
      console.log('Image téléchargée:', {
        taille: imageBlob.size,
        type: imageBlob.type
      });

      if (imageBlob.size === 0) {
        console.error('Image vide reçue');
        return { processedUrl: null, error: 'Image vide' };
      }

      // Génération d'un nom de fichier unique
      const fileExt = imageBlob.type.split('/')[1] || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      console.log('Nom de fichier généré:', fileName);

      // Upload vers Supabase avec paramètres optimisés
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, imageBlob, {
          contentType: imageBlob.type,
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur lors de l\'upload vers Supabase:', uploadError);
        return { 
          processedUrl: null, 
          error: `Erreur d'upload: ${uploadError.message}` 
        };
      }

      console.log('Image uploadée avec succès:', uploadData);

      // Obtention de l'URL publique
      const { data: { publicUrl } } = this.supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);

      console.log('URL publique générée:', publicUrl);
      return { processedUrl: publicUrl };

    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      return { 
        processedUrl: null, 
        error: `Erreur inattendue: ${error.message}` 
      };
    }
  }
}
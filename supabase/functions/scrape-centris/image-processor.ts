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

      // Modifier l'URL pour obtenir une image de meilleure qualité
      const enhancedImageUrl = this.enhanceImageQuality(imageUrl);
      console.log('URL améliorée:', enhancedImageUrl);

      // Headers spécifiques pour Centris avec cookie et autres en-têtes importants
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'Referer': 'https://www.centris.ca/',
        'Origin': 'https://www.centris.ca',
        'Cookie': 'TS01c97684=01ef61aed0c1f741d1d6cd8e7488f6d8e3c8c3c8'
      };

      // Télécharger l'image depuis Centris avec un timeout plus long
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      console.log('Envoi de la requête avec les en-têtes:', headers);
      const imageResponse = await fetch(enhancedImageUrl, {
        headers,
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeout);

      if (!imageResponse.ok) {
        console.error('Échec du téléchargement de l\'image:', {
          status: imageResponse.status,
          statusText: imageResponse.statusText,
          headers: Object.fromEntries(imageResponse.headers.entries())
        });
        return { processedUrl: null, error: `Échec du téléchargement: ${imageResponse.status}` };
      }

      const contentType = imageResponse.headers.get('content-type');
      console.log('Type de contenu:', contentType);

      // Vérification plus souple du type de contenu
      if (!contentType) {
        console.log('Type de contenu non spécifié, on suppose que c\'est une image');
      } else if (!contentType.startsWith('image/')) {
        console.error('Type de contenu reçu:', contentType);
        return { processedUrl: null, error: 'Type de contenu invalide' };
      }

      const imageBlob = await imageResponse.blob();
      console.log('Taille du blob:', imageBlob.size);

      if (imageBlob.size === 0) {
        console.error('Image vide reçue');
        return { processedUrl: null, error: 'Image vide' };
      }

      // Générer un nom de fichier unique
      const fileExt = 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      console.log('Nom du fichier généré:', fileName);

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          upsert: false,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        return { processedUrl: null, error: 'Upload échoué: ' + uploadError.message };
      }

      console.log('Upload réussi:', uploadData);

      // Générer l'URL publique
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

  private enhanceImageQuality(imageUrl: string): string {
    // Vérifier si l'URL contient déjà des paramètres de taille
    if (imageUrl.includes('&w=') || imageUrl.includes('&h=')) {
      // Remplacer les paramètres existants par des valeurs plus élevées
      return imageUrl.replace(/[&?]w=\d+/, '&w=1920')
                    .replace(/[&?]h=\d+/, '&h=1080')
                    .replace(/[&?]sm=\w+/, '&sm=c');
    }
    
    // Si l'URL n'a pas de paramètres, ajouter les nouveaux
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}w=1920&h=1080&sm=c`;
  }
}
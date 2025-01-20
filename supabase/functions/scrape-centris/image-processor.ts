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
    // Paramètres pour obtenir la meilleure qualité possible
    const params = new URLSearchParams({
      w: '4096',          // Largeur maximale
      h: '3072',          // Hauteur maximale
      sm: 'both',         // Scale mode: both pour conserver les proportions
      q: '100',           // Qualité maximale
      mt: 'true',         // Maintenir la transparence si présente
      watermark: 'false'  // Désactiver le filigrane
    });

    // Si l'URL contient déjà des paramètres, on les remplace
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?${params.toString()}`;
  }

  private async getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Impossible de lire les dimensions de l'image"));
      };
    });
  }

  async processImage(imageUrl: string): Promise<ImageProcessingResult> {
    try {
      console.log('Traitement de l\'image:', imageUrl);

      if (!this.isValidImageUrl(imageUrl)) {
        console.error('URL invalide:', imageUrl);
        return { processedUrl: null, error: 'URL invalide' };
      }

      const cleanedUrl = this.cleanImageUrl(imageUrl);
      console.log('URL nettoyée avec paramètres de qualité:', cleanedUrl);

      const response = await fetch(cleanedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.9',  // Accepte tous les types d'images en priorité
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
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

      // Logs détaillés sur l'image téléchargée
      console.log('Informations sur l\'image téléchargée:');
      console.log('- Taille:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('- Type MIME:', blob.type);

      // Vérification de la taille minimale attendue (au moins 1 MB pour une image HD)
      if (blob.size < 1024 * 1024) {
        console.warn('⚠️ Attention: Image de petite taille détectée');
      }

      // Conserver l'extension originale de l'image
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      console.log('Nom du fichier généré:', fileName);

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('listings-images')
        .upload(fileName, blob, {
          contentType: blob.type,
          duplex: 'half',
          cacheControl: '31536000', // Cache d'un an pour les images statiques
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
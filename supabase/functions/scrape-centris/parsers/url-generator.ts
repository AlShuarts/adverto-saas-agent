import { UrlValidator } from './url-validator.ts';

export class UrlGenerator {
  static createHighQualityUrl(centrisId: string): string {
    // Format haute qualité avec paramètres spécifiques pour une qualité maximale
    return `https://mspublic.centris.ca/media.ashx?id=${centrisId}&t=pi&sm=L&w=4096&h=3072&q=100`;
  }

  static cleanImageUrl(url: string): string | null {
    try {
      console.log('Nettoyage de l\'URL:', url);
      
      if (!UrlValidator.isValid(url)) {
        console.log('URL invalide:', url);
        return null;
      }

      const centrisId = UrlValidator.extractCentrisId(url);
      if (centrisId) {
        const highQualityUrl = this.createHighQualityUrl(centrisId);
        console.log('URL haute qualité générée:', highQualityUrl);
        return highQualityUrl;
      }

      // Si l'URL ne contient pas d'ID Centris mais est valide, ajouter les paramètres de qualité
      try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('w', '4096');
        urlObj.searchParams.set('h', '3072');
        urlObj.searchParams.set('q', '100');
        return urlObj.toString();
      } catch {
        return url;
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'URL:', error);
      return null;
    }
  }
}
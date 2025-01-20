import { UrlValidator } from './url-validator.ts';

export class UrlGenerator {
  static createHighQualityUrl(centrisId: string): string {
    // Format haute qualité sans paramètres de redimensionnement
    return `https://mspublic.centris.ca/media.ashx?id=${centrisId}&t=pi&f=I`;
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

      return url;
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'URL:', error);
      return null;
    }
  }
}
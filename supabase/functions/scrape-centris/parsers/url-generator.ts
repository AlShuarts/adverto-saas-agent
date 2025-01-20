import { UrlValidator } from './url-validator.ts';

export class UrlGenerator {
  static createHighQualityUrl(centrisId: string): string {
    // Format haute qualité avec paramètres spécifiques
    return `https://mspublic.centris.ca/media.ashx?id=${centrisId}&t=pi&sm=L&w=4096&h=3072&q=100`;
  }

  static cleanImageUrl(url: string): string | null {
    try {
      console.log('Nettoyage de l\'URL:', url);
      
      if (!UrlValidator.isValid(url)) {
        console.log('URL invalide:', url);
        return null;
      }

      // Si l'URL contient déjà un ID Centris, générer une URL haute qualité
      const centrisId = UrlValidator.extractCentrisId(url);
      if (centrisId) {
        const highQualityUrl = this.createHighQualityUrl(centrisId);
        console.log('URL haute qualité générée:', highQualityUrl);
        return highQualityUrl;
      }

      // Si l'URL ne contient pas d'ID mais est valide, ajouter les paramètres de qualité
      try {
        const urlObj = new URL(url);
        
        // Si l'URL contient déjà media.ashx, ajouter/mettre à jour les paramètres
        if (url.includes('media.ashx')) {
          urlObj.searchParams.set('w', '4096');
          urlObj.searchParams.set('h', '3072');
          urlObj.searchParams.set('q', '100');
          if (!urlObj.searchParams.has('t')) urlObj.searchParams.set('t', 'pi');
          if (!urlObj.searchParams.has('sm')) urlObj.searchParams.set('sm', 'L');
          
          const finalUrl = urlObj.toString();
          console.log('URL modifiée avec paramètres de qualité:', finalUrl);
          return finalUrl;
        }
        
        return url;
      } catch {
        console.log('URL non modifiable, retour de l\'URL originale');
        return url;
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'URL:', error);
      return null;
    }
  }
}
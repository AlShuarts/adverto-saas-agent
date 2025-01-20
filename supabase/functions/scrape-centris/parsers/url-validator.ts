export class UrlValidator {
  private static readonly VALID_MARKERS = [
    'mspublic.centris.ca/media',
    'centris.ca/media',
    'media.ashx'
  ];

  static isValid(url: string): boolean {
    if (!url) return false;
    
    return this.VALID_MARKERS.some(marker => url.includes(marker));
  }

  static extractCentrisId(url: string): string | null {
    try {
      // Vérifier si l'URL contient déjà un ID dans les paramètres
      if (url.includes('media.ashx')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('id');
        if (id?.length === 32) return id;
      }

      // Rechercher un ID dans l'URL
      const matches = url.match(/[A-F0-9]{32}/i);
      return matches?.[0] || null;

    } catch (error) {
      console.error('Error extracting Centris ID:', error);
      return null;
    }
  }
}
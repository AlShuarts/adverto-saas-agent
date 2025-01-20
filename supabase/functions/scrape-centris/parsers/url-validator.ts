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
      // Extraire l'ID directement des paramètres de l'URL
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get('id');
      
      // Vérifier si l'ID est au format attendu (32 caractères hexadécimaux)
      if (id && /^[A-F0-9]{32}$/i.test(id)) {
        console.log('ID Centris extrait:', id);
        return id;
      }

      // Si l'ID n'est pas dans les paramètres, chercher dans l'URL
      const matches = url.match(/[A-F0-9]{32}/i);
      if (matches && matches[0]) {
        console.log('ID Centris trouvé dans l\'URL:', matches[0]);
        return matches[0];
      }

      console.log('Aucun ID Centris valide trouvé dans l\'URL');
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID Centris:', error);
      return null;
    }
  }
}
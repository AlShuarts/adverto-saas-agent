export class UrlGenerator {
  static createHighQualityUrl(centrisId: string): string {
    return `https://mspublic.centris.ca/media.ashx?id=${centrisId}&t=pi&sm=h&w=1920&h=1080`;
  }

  static cleanImageUrl(url: string): string | null {
    try {
      console.log('Cleaning URL:', url);
      
      if (!UrlValidator.isValid(url)) {
        console.log('Invalid URL:', url);
        return null;
      }

      const centrisId = UrlValidator.extractCentrisId(url);
      if (centrisId) {
        return this.createHighQualityUrl(centrisId);
      }

      return url;
    } catch (error) {
      console.error('Error cleaning URL:', error);
      return null;
    }
  }
}
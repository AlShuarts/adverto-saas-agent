export class ImageParser {
  private doc: any;
  private seenUrls: Set<string>;

  constructor(doc: any) {
    this.doc = doc;
    this.seenUrls = new Set<string>();
    console.log('ImageParser initialized');
  }

  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    const validMarkers = [
      'mspublic.centris.ca/media',
      'centris.ca/media',
      'media.ashx'
    ];
    
    return validMarkers.some(marker => url.includes(marker));
  }

  private cleanImageUrl(url: string): string | null {
    try {
      console.log('Cleaning URL:', url);
      
      // Si l'URL contient déjà un ID Centris
      if (url.includes('media.ashx')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('id');
        if (id && id.length === 32) {
          // Utiliser directement l'URL Centris en haute résolution
          return `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&sm=h&w=1920&h=1080`;
        }
      }

      // Rechercher un ID dans l'URL
      const matches = url.match(/[A-F0-9]{32}/i);
      if (matches && matches[0]) {
        return `https://mspublic.centris.ca/media.ashx?id=${matches[0]}&t=pi&sm=h&w=1920&h=1080`;
      }

      // Si c'est une URL valide mais sans ID
      if (this.isValidImageUrl(url)) {
        return url;
      }

      console.log('Could not clean URL:', url);
      return null;
    } catch (error) {
      console.error('Error cleaning URL:', error);
      return null;
    }
  }

  getImageUrls(): string[] {
    console.log('Starting image extraction');
    const imageUrls = new Set<string>();
    
    // Récupérer tout le contenu HTML
    const htmlContent = this.doc.documentElement.innerHTML;
    
    // Rechercher toutes les URLs Centris
    const urlRegex = /https:\/\/[^"'\s)}>]*(?:centris\.ca|media\.ashx)[^"'\s)}>]*/g;
    const directUrls = htmlContent.match(urlRegex) || [];
    console.log(`Found ${directUrls.length} direct URLs in HTML`);
    
    // Traiter les URLs trouvées
    directUrls.forEach(url => {
      if (this.isValidImageUrl(url)) {
        const cleanedUrl = this.cleanImageUrl(url);
        if (cleanedUrl) imageUrls.add(cleanedUrl);
      }
    });

    // Rechercher les IDs d'images
    const idMatches = htmlContent.match(/[A-F0-9]{32}/gi) || [];
    console.log(`Found ${idMatches.length} image IDs`);
    
    idMatches.forEach(id => {
      // Utiliser directement l'URL haute résolution
      const url = `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&sm=h&w=1920&h=1080`;
      imageUrls.add(url);
    });

    // Parcourir les éléments img
    const imageSelectors = this.doc.querySelectorAll('img');
    console.log(`Found ${imageSelectors.length} img elements`);

    imageSelectors.forEach((img: any) => {
      ['src', 'data-src', 'data-original', 'srcset'].forEach(attr => {
        const value = img.getAttribute(attr);
        if (value && this.isValidImageUrl(value)) {
          const cleanedUrl = this.cleanImageUrl(value);
          if (cleanedUrl) imageUrls.add(cleanedUrl);
        }
      });
    });

    const uniqueUrls = [...imageUrls];
    console.log(`Final unique image URLs found: ${uniqueUrls.length}`);
    console.log('Image URLs:', uniqueUrls);
    
    return uniqueUrls;
  }
}
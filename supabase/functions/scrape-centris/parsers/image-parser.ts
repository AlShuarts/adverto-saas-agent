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
    
    // Vérifie si l'URL contient des marqueurs Centris valides
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
      
      // Si l'URL est déjà au format media.ashx, vérifier et retourner
      if (url.includes('media.ashx')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('id');
        if (id && id.length === 32) {
          // Modifier l'URL pour obtenir l'image en haute qualité
          const highQualityUrl = `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&sm=h&w=1920&h=1080`;
          console.log('High quality URL:', highQualityUrl);
          return highQualityUrl;
        }
      }

      // Recherche d'un ID de 32 caractères hexadécimaux
      const matches = url.match(/[A-F0-9]{32}/i);
      if (matches && matches[0]) {
        const highQualityUrl = `https://mspublic.centris.ca/media.ashx?id=${matches[0]}&t=pi&sm=h&w=1920&h=1080`;
        console.log('High quality URL:', highQualityUrl);
        return highQualityUrl;
      }

      // Si aucun ID n'est trouvé mais que l'URL semble valide
      if (this.isValidImageUrl(url)) {
        console.log('Valid URL but no ID found:', url);
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
    
    // Récupérer tout le contenu HTML pour analyse
    const htmlContent = this.doc.documentElement.innerHTML;
    
    // Rechercher toutes les URLs contenant des marqueurs Centris
    const urlRegex = /https:\/\/[^"'\s)}>]*(?:centris\.ca|media\.ashx)[^"'\s)}>]*/g;
    const directUrls = htmlContent.match(urlRegex) || [];
    console.log(`Found ${directUrls.length} direct URLs in HTML`);
    
    // Traiter les URLs trouvées directement dans le HTML
    directUrls.forEach(url => {
      if (this.isValidImageUrl(url)) {
        const cleanedUrl = this.cleanImageUrl(url);
        if (cleanedUrl) imageUrls.add(cleanedUrl);
      }
    });

    // Rechercher les IDs d'images dans le HTML
    const idMatches = htmlContent.match(/[A-F0-9]{32}/gi) || [];
    console.log(`Found ${idMatches.length} image IDs`);
    
    idMatches.forEach(id => {
      const url = `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&f=I`;
      imageUrls.add(url);
    });

    // Parcourir tous les éléments img avec les sélecteurs spécifiés
    const imageSelectors = this.doc.querySelectorAll('img');
    console.log(`Found ${imageSelectors.length} img elements`);

    imageSelectors.forEach((img: any) => {
      const attributes = ['src', 'data-src', 'data-original', 'srcset'];
      attributes.forEach(attr => {
        const value = img.getAttribute(attr);
        if (value && this.isValidImageUrl(value)) {
          const cleanedUrl = this.cleanImageUrl(value);
          if (cleanedUrl) imageUrls.add(cleanedUrl);
        }
      });
    });

    // Rechercher dans les scripts pour les URLs d'images
    const scripts = this.doc.getElementsByTagName('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      const scriptUrlMatches = content.match(urlRegex) || [];
      scriptUrlMatches.forEach(url => {
        if (this.isValidImageUrl(url)) {
          const cleanedUrl = this.cleanImageUrl(url);
          if (cleanedUrl) imageUrls.add(cleanedUrl);
        }
      });
    }

    const uniqueUrls = [...imageUrls];
    console.log(`Final unique image URLs found: ${uniqueUrls.length}`);
    console.log('Image URLs:', uniqueUrls);
    
    return uniqueUrls;
  }
}
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
    
    // Accepter uniquement les URLs qui contiennent centris.ca/media.ashx
    return url.includes('centris.ca/media.ashx');
  }

  private cleanImageUrl(url: string): string {
    try {
      // Si l'URL ne contient pas media.ashx, on essaie d'extraire l'ID de l'image
      if (!url.includes('media.ashx')) {
        const matches = url.match(/[A-Z0-9]{32}/);
        if (matches && matches[0]) {
          return `https://mspublic.centris.ca/media.ashx?id=${matches[0]}&t=pi&f=I`;
        }
        return url;
      }

      const originalUrl = new URL(url);
      const params = new URLSearchParams(originalUrl.search);
      
      const imageId = params.get('id');
      if (!imageId) {
        console.log('Pas d\'ID d\'image trouvé dans l\'URL:', url);
        return url;
      }

      // Construction de l'URL avec le format correct
      return `https://mspublic.centris.ca/media.ashx?id=${imageId}&t=pi&f=I`;
    } catch (error) {
      console.log('Erreur lors du nettoyage de l\'URL:', error);
      return url;
    }
  }

  getImageUrls(): string[] {
    console.log('Début de l\'extraction des images');
    const imageUrls: string[] = [];
    
    // Recherche dans tous les éléments img de la page
    const allImages = this.doc.getElementsByTagName('img');
    console.log(`Nombre total d'images trouvées: ${allImages.length}`);

    for (const img of allImages) {
      const src = img.getAttribute("src");
      const dataSrc = img.getAttribute("data-src");
      const dataOriginal = img.getAttribute("data-original");
      const srcset = img.getAttribute("srcset");
      
      [src, dataSrc, dataOriginal].forEach(url => {
        if (url && !this.seenUrls.has(url)) {
          const cleanedUrl = this.cleanImageUrl(url);
          if (this.isValidImageUrl(cleanedUrl)) {
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Image trouvée et nettoyée:', cleanedUrl);
          }
        }
      });

      if (srcset) {
        const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
        srcsetUrls.forEach(url => {
          if (!this.seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            if (this.isValidImageUrl(cleanedUrl)) {
              this.seenUrls.add(cleanedUrl);
              imageUrls.push(cleanedUrl);
            }
          }
        });
      }
    }

    // Recherche dans les scripts pour les URLs d'images
    const scripts = this.doc.getElementsByTagName('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      const matches = content.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|webp)[^"'\s]*/gi);
      if (matches) {
        matches.forEach(url => {
          if (!this.seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            if (this.isValidImageUrl(cleanedUrl)) {
              this.seenUrls.add(cleanedUrl);
              imageUrls.push(cleanedUrl);
            }
          }
        });
      }

      // Recherche spécifique des IDs d'images Centris
      const idMatches = content.match(/[A-Z0-9]{32}/g);
      if (idMatches) {
        idMatches.forEach(id => {
          const url = `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&f=I`;
          if (!this.seenUrls.has(url)) {
            this.seenUrls.add(url);
            imageUrls.push(url);
            console.log('ID d\'image Centris trouvé:', id);
          }
        });
      }
    }
    
    console.log(`Total d'images uniques trouvées: ${imageUrls.length}`);
    return [...new Set(imageUrls)];
  }
}
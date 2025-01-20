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
    
    // Accepter toutes les URLs qui contiennent centris.ca
    return url.includes('centris.ca');
  }

  private cleanImageUrl(url: string): string {
    try {
      // Si l'URL ne contient pas media.ashx, on la retourne telle quelle
      if (!url.includes('media.ashx')) {
        return url;
      }

      const originalUrl = new URL(url);
      const params = new URLSearchParams(originalUrl.search);
      
      const imageId = params.get('id');
      if (!imageId) {
        console.log('Pas d\'ID d\'image trouvé dans l\'URL:', url);
        return url;
      }

      // Paramètres optimisés pour la qualité d'image
      const newParams = new URLSearchParams();
      newParams.set('id', imageId);
      newParams.set('t', 'photo');
      newParams.set('sm', 'c');
      newParams.set('w', '800');
      newParams.set('h', '600');
      newParams.set('quality', '85');

      return `https://mspublic.centris.ca/media.ashx?${newParams.toString()}`;
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
          if (this.isValidImageUrl(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Image trouvée et nettoyée:', cleanedUrl);
          }
        }
      });

      if (srcset) {
        const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
        srcsetUrls.forEach(url => {
          if (!this.seenUrls.has(url) && this.isValidImageUrl(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
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
          if (!this.seenUrls.has(url) && this.isValidImageUrl(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
          }
        });
      }
    }
    
    console.log(`Total d'images uniques trouvées: ${imageUrls.length}`);
    return [...new Set(imageUrls)];
  }
}
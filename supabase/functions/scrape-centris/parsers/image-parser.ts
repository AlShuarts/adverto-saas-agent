export class ImageParser {
  private doc: any;
  private seenUrls: Set<string>;

  constructor(doc: any) {
    this.doc = doc;
    this.seenUrls = new Set<string>();
  }

  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('mspublic.centris.ca/media.ashx');
  }

  private cleanImageUrl(url: string): string {
    try {
      console.log('Nettoyage de l\'URL:', url);
      
      const originalUrl = new URL(url);
      const params = new URLSearchParams(originalUrl.search);
      
      const imageId = params.get('id');
      if (!imageId) {
        console.error('Pas d\'ID d\'image trouvé dans l\'URL:', url);
        return url;
      }

      const newParams = new URLSearchParams();
      newParams.set('id', imageId);
      newParams.set('t', 'photo');
      newParams.set('sm', 'c');

      const finalUrl = `https://mspublic.centris.ca/media.ashx?${newParams.toString()}`;
      console.log('URL d\'image nettoyée:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'URL:', error);
      return url;
    }
  }

  getImageUrls(): string[] {
    console.log('Début de l\'extraction des images');
    const imageUrls: string[] = [];
    
    // Recherche dans les balises img
    const selectors = [
      'img[src*="centris.ca"]',
      'img[data-src*="centris.ca"]',
      '.MainImg img',
      '#divMainPhoto img',
      '.photo-gallery img',
      '.carouselbox img',
      '.carousel-item img'
    ];
    
    for (const selector of selectors) {
      const elements = this.doc.querySelectorAll(selector);
      console.log(`${elements.length} éléments trouvés avec le sélecteur ${selector}`);
      
      for (const img of elements) {
        const src = img.getAttribute("src");
        const dataSrc = img.getAttribute("data-src");
        
        [src, dataSrc].forEach(url => {
          if (url && this.isValidImageUrl(url) && !this.seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Image trouvée:', cleanedUrl);
          }
        });
      }
    }

    // Recherche dans les scripts
    const scripts = this.doc.getElementsByTagName('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      const matches = content.match(/https:\/\/mspublic\.centris\.ca\/media\.ashx\?[^"'\s]+/g);
      if (matches) {
        matches.forEach(url => {
          if (this.isValidImageUrl(url) && !this.seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Image trouvée dans le script:', cleanedUrl);
          }
        });
      }
    }
    
    console.log(`Total d'images uniques trouvées: ${imageUrls.length}`);
    return [...new Set(imageUrls)];
  }
}
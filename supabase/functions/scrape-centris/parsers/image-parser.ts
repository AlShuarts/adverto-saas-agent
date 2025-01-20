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

  private extractFromScript(): string[] {
    const imageUrls: string[] = [];
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
    
    return imageUrls;
  }

  private extractFromImageTags(): string[] {
    const imageUrls: string[] = [];
    const selectors = [
      'img[src*="mspublic.centris.ca"]',
      'img[data-src*="mspublic.centris.ca"]',
      '.photo-gallery img',
      '.carouselbox img',
      '.carousel-item img',
      '.MainImg img',
      '#divMainPhoto img'
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
            console.log('Image trouvée dans une balise img:', cleanedUrl);
          }
        });
      }
    }
    
    return imageUrls;
  }

  getImageUrls(): string[] {
    console.log('Début de l\'extraction des images');
    
    const scriptUrls = this.extractFromScript();
    console.log(`${scriptUrls.length} images trouvées dans les scripts`);
    
    const imageTagUrls = this.extractFromImageTags();
    console.log(`${imageTagUrls.length} images trouvées dans les balises img`);
    
    const allUrls = [...new Set([...scriptUrls, ...imageTagUrls])];
    console.log(`Total d'images uniques trouvées: ${allUrls.length}`);
    
    return allUrls;
  }
}
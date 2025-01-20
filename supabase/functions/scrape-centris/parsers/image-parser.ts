export class ImageParser {
  private doc: any;
  private seenUrls: Set<string>;

  constructor(doc: any) {
    this.doc = doc;
    this.seenUrls = new Set<string>();
  }

  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('mspublic.centris.ca/media.ashx') || url.includes('centris.ca');
  }

  private cleanImageUrl(url: string): string {
    try {
      console.log('Nettoyage de l\'URL:', url);
      
      // Si l'URL ne contient pas media.ashx, la retourner telle quelle
      if (!url.includes('media.ashx')) {
        console.log('URL sans media.ashx, retournée telle quelle:', url);
        return url;
      }

      const originalUrl = new URL(url);
      const params = new URLSearchParams(originalUrl.search);
      
      // Récupérer l'ID de l'image
      const imageId = params.get('id');
      if (!imageId) {
        console.error('Pas d\'ID d\'image trouvé dans l\'URL:', url);
        return url;
      }

      // Construire une nouvelle URL optimisée
      const newParams = new URLSearchParams();
      newParams.set('id', imageId);
      newParams.set('t', 'photo');
      newParams.set('sm', 'c');
      newParams.set('w', '1920');
      newParams.set('h', '1080');

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
      const matches = content.match(/https:\/\/[^"'\s]*?centris\.ca[^"'\s]*/g);
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
      'img[src*="centris.ca"]',
      'img[data-src*="centris.ca"]',
      'img[srcset*="centris.ca"]',
      '.MainImg img',
      '#divMainPhoto img',
      '.photo-gallery img',
      '.carouselbox img',
      '.carousel-item img',
      '.property-thumbnail img'
    ];
    
    for (const selector of selectors) {
      const elements = this.doc.querySelectorAll(selector);
      console.log(`${elements.length} éléments trouvés avec le sélecteur ${selector}`);
      
      for (const img of elements) {
        const src = img.getAttribute("src");
        const dataSrc = img.getAttribute("data-src");
        const srcset = img.getAttribute("srcset");
        
        [src, dataSrc].forEach(url => {
          if (url && this.isValidImageUrl(url) && !this.seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Image trouvée dans une balise img:', cleanedUrl);
          }
        });

        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          srcsetUrls.forEach(url => {
            if (this.isValidImageUrl(url) && !this.seenUrls.has(url)) {
              const cleanedUrl = this.cleanImageUrl(url);
              this.seenUrls.add(cleanedUrl);
              imageUrls.push(cleanedUrl);
              console.log('Image trouvée dans srcset:', cleanedUrl);
            }
          });
        }
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
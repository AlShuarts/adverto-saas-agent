export class ImageParser {
  private doc: any;
  private seenUrls: Set<string>;

  constructor(doc: any) {
    this.doc = doc;
    this.seenUrls = new Set<string>();
  }

  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    const isCentrisUrl = url.includes('mspublic.centris.ca/media.ashx');
    const hasRequiredParams = url.includes('id=') && 
                            (url.includes('&t=pi') || url.includes('&t=photo'));
    return isCentrisUrl && hasRequiredParams;
  }

  private cleanImageUrl(url: string): string {
    if (!url.includes('&w=') && !url.includes('&h=')) {
      url += '&w=640&h=480&sm=c';
    }
    return url;
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
            console.log('Found image URL in script:', cleanedUrl);
          }
        });
      }
    }
    
    return imageUrls;
  }

  private extractFromImageTags(selectors: string[]): string[] {
    const imageUrls: string[] = [];
    
    for (const selector of selectors) {
      const elements = this.doc.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements with selector ${selector}`);
      
      for (const img of elements) {
        const src = img.getAttribute("src");
        const dataSrc = img.getAttribute("data-src");
        const srcset = img.getAttribute("srcset");
        
        [src, dataSrc].forEach(url => {
          if (url && this.isValidImageUrl(url) && !this.seenUrls.has(url)) {
            const cleanedUrl = this.cleanImageUrl(url);
            this.seenUrls.add(cleanedUrl);
            imageUrls.push(cleanedUrl);
            console.log('Found image URL in img tag:', cleanedUrl);
          }
        });

        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          srcsetUrls.forEach(url => {
            if (this.isValidImageUrl(url) && !this.seenUrls.has(url)) {
              const cleanedUrl = this.cleanImageUrl(url);
              this.seenUrls.add(cleanedUrl);
              imageUrls.push(cleanedUrl);
              console.log('Found image URL in srcset:', cleanedUrl);
            }
          });
        }
      }
    }
    
    return imageUrls;
  }

  getImageUrls(selectors: string[]): string[] {
    console.log('Starting to extract image URLs');
    
    const scriptUrls = this.extractFromScript();
    const imageTagUrls = this.extractFromImageTags(selectors);
    const allUrls = [...scriptUrls, ...imageTagUrls];
    
    console.log('Total unique images found:', allUrls.length);
    return allUrls;
  }
}
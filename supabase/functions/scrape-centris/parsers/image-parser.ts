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
    const hasRequiredParams = url.includes('id=');
    return isCentrisUrl && hasRequiredParams;
  }

  private cleanImageUrl(url: string): string {
    const idMatch = url.match(/id=([^&]+)/);
    if (!idMatch) return url;
    
    const imageId = idMatch[1];
    return `https://mspublic.centris.ca/media.ashx?id=${imageId}&t=pi&f=I`;
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

  getImageUrls(selectors: string[]): string[] {
    console.log('Starting to extract image URLs');
    const scriptUrls = this.extractFromScript();
    console.log('Total unique images found:', scriptUrls.length);
    return scriptUrls;
  }
}
import { UrlValidator } from './url-validator';
import { UrlGenerator } from './url-generator';

export class HtmlExtractor {
  private doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  private extractFromHtmlContent(): Set<string> {
    const imageUrls = new Set<string>();
    const htmlContent = this.doc.documentElement.innerHTML;
    
    // Rechercher toutes les URLs Centris
    const urlRegex = /https:\/\/[^"'\s)}>]*(?:centris\.ca|media\.ashx)[^"'\s)}>]*/g;
    const directUrls = htmlContent.match(urlRegex) || [];
    console.log(`Found ${directUrls.length} direct URLs in HTML`);
    
    directUrls.forEach(url => {
      if (UrlValidator.isValid(url)) {
        const cleanedUrl = UrlGenerator.cleanImageUrl(url);
        if (cleanedUrl) imageUrls.add(cleanedUrl);
      }
    });

    return imageUrls;
  }

  private extractFromImageElements(): Set<string> {
    const imageUrls = new Set<string>();
    const imageElements = this.doc.querySelectorAll('img');
    console.log(`Found ${imageElements.length} img elements`);

    imageElements.forEach((img: any) => {
      ['src', 'data-src', 'data-original', 'srcset'].forEach(attr => {
        const value = img.getAttribute(attr);
        if (value && UrlValidator.isValid(value)) {
          const cleanedUrl = UrlGenerator.cleanImageUrl(value);
          if (cleanedUrl) imageUrls.add(cleanedUrl);
        }
      });
    });

    return imageUrls;
  }

  private extractFromCentrisIds(): Set<string> {
    const imageUrls = new Set<string>();
    const htmlContent = this.doc.documentElement.innerHTML;
    
    const idMatches = htmlContent.match(/[A-F0-9]{32}/gi) || [];
    console.log(`Found ${idMatches.length} image IDs`);
    
    idMatches.forEach(id => {
      const url = UrlGenerator.createHighQualityUrl(id);
      imageUrls.add(url);
    });

    return imageUrls;
  }

  extract(): string[] {
    console.log('Starting image extraction');
    
    const allUrls = new Set<string>([
      ...this.extractFromHtmlContent(),
      ...this.extractFromImageElements(),
      ...this.extractFromCentrisIds()
    ]);

    const uniqueUrls = [...allUrls];
    console.log(`Final unique image URLs found: ${uniqueUrls.length}`);
    console.log('Image URLs:', uniqueUrls);
    
    return uniqueUrls;
  }
}
import { UrlValidator } from './url-validator.ts';
import { UrlGenerator } from './url-generator.ts';

export class HtmlExtractor {
  private doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  private extractFromPhotoViewer(): Set<string> {
    const imageUrls = new Set<string>();
    
    try {
      // Trouver le conteneur principal du visualiseur de photos avec l'attribut show
      const photoViewer = this.doc.querySelector('.photoViewer.photoViewerOnPage[show]');
      if (photoViewer) {
        console.log('PhotoViewer avec attribut show trouvé');
        
        // Chercher dans la galerie avec l'attribut ondragstart
        const gallery = photoViewer.querySelector('.gallery[ondragstart]');
        if (gallery) {
          console.log('Gallery avec ondragstart trouvée');
          
          // Chercher toutes les images dans les wrappers avec style height
          const imageWrappers = gallery.querySelectorAll('.image-wrapper[style*="height"]');
          console.log(`Nombre d'image-wrappers avec style height trouvés: ${imageWrappers.length}`);
          
          imageWrappers.forEach((wrapper: Element, index: number) => {
            // Chercher l'image avec id fullImg et src
            const fullImg = wrapper.querySelector('img#fullImg[src]');
            if (fullImg) {
              const src = fullImg.getAttribute('src');
              console.log(`Image ${index + 1} trouvée avec src:`, src);
              
              if (src && UrlValidator.isValid(src)) {
                const cleanedUrl = UrlGenerator.cleanImageUrl(src);
                if (cleanedUrl) {
                  imageUrls.add(cleanedUrl);
                  console.log('URL nettoyée ajoutée:', cleanedUrl);
                }
              }
            } else {
              console.log(`Pas d'image fullImg trouvée dans le wrapper ${index + 1}`);
            }
          });
        } else {
          console.log('Gallery avec ondragstart non trouvée');
        }
      } else {
        console.log('PhotoViewer avec attribut show non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction depuis PhotoViewer:', error);
    }

    return imageUrls;
  }

  private extractFromHtmlContent(): Set<string> {
    const imageUrls = new Set<string>();
    const htmlContent = this.doc.documentElement.innerHTML;
    
    // Rechercher toutes les URLs Centris
    const urlRegex = /https:\/\/[^"'\s)}>]*(?:centris\.ca|media\.ashx)[^"'\s)}>]*/g;
    const directUrls = htmlContent.match(urlRegex) || [];
    console.log(`Trouvé ${directUrls.length} URLs directes dans le HTML`);
    
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
    console.log(`Trouvé ${imageElements.length} éléments img`);

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
    console.log(`Trouvé ${idMatches.length} IDs d'images`);
    
    idMatches.forEach(id => {
      const url = UrlGenerator.createHighQualityUrl(id);
      imageUrls.add(url);
    });

    return imageUrls;
  }

  extract(): string[] {
    console.log('Démarrage de l\'extraction des images');
    
    // Commencer par la méthode spécifique du PhotoViewer
    const photoViewerUrls = this.extractFromPhotoViewer();
    console.log(`URLs trouvées dans PhotoViewer: ${photoViewerUrls.size}`);
    
    // Si aucune image n'est trouvée dans le PhotoViewer, utiliser les méthodes alternatives
    let allUrls: Set<string>;
    if (photoViewerUrls.size > 0) {
      allUrls = photoViewerUrls;
      console.log('Utilisation des URLs du PhotoViewer');
    } else {
      console.log('Aucune URL trouvée dans PhotoViewer, utilisation des méthodes alternatives');
      allUrls = new Set<string>([
        ...this.extractFromHtmlContent(),
        ...this.extractFromImageElements(),
        ...this.extractFromCentrisIds()
      ]);
    }

    const uniqueUrls = [...allUrls];
    console.log(`URLs d'images uniques trouvées: ${uniqueUrls.length}`);
    console.log('URLs des images:', uniqueUrls);
    
    return uniqueUrls;
  }
}
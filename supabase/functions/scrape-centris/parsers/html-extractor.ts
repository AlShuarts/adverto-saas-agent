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
      // Trouver le conteneur principal du visualiseur de photos
      const photoViewer = this.doc.querySelector('#divMainPhoto');
      if (photoViewer) {
        console.log('PhotoViewer trouvé');
        
        // Chercher l'image principale
        const fullImg = photoViewer.querySelector('img#fullImg');
        if (fullImg) {
          const src = fullImg.getAttribute('src');
          console.log('Image principale trouvée avec src:', src);
          
          if (src && UrlValidator.isValid(src)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(src);
            if (cleanedUrl) {
              imageUrls.add(cleanedUrl);
              console.log('URL nettoyée ajoutée:', cleanedUrl);
            }
          }
        }

        // Chercher les miniatures pour obtenir tous les IDs d'images
        const thumbnails = this.doc.querySelectorAll('.thumbPhoto');
        console.log(`Nombre de miniatures trouvées: ${thumbnails.length}`);
        
        thumbnails.forEach((thumb: Element) => {
          const onclick = thumb.getAttribute('onclick');
          if (onclick) {
            const match = onclick.match(/showPhoto\('([^']+)'/);
            if (match && match[1]) {
              const imageId = match[1];
              const highQualityUrl = UrlGenerator.createHighQualityUrl(imageId);
              imageUrls.add(highQualityUrl);
              console.log('URL haute qualité générée depuis miniature:', highQualityUrl);
            }
          }
        });
      } else {
        console.log('PhotoViewer non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction depuis PhotoViewer:', error);
    }

    return imageUrls;
  }

  private extractFromHtmlContent(): Set<string> {
    const imageUrls = new Set<string>();
    const htmlContent = this.doc.documentElement.innerHTML;
    
    // Rechercher tous les IDs d'images Centris
    const idRegex = /showPhoto\('([A-F0-9]{32})'\)/g;
    let match;
    while ((match = idRegex.exec(htmlContent)) !== null) {
      const imageId = match[1];
      const url = UrlGenerator.createHighQualityUrl(imageId);
      imageUrls.add(url);
      console.log('ID d\'image trouvé dans le HTML:', imageId);
    }

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
        ...this.extractFromHtmlContent()
      ]);
    }

    const uniqueUrls = [...allUrls];
    console.log(`URLs d'images uniques trouvées: ${uniqueUrls.length}`);
    console.log('URLs des images:', uniqueUrls);
    
    return uniqueUrls;
  }
}
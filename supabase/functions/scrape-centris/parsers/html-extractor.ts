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
      // Recherche dans le conteneur principal des photos
      const photoViewers = this.doc.querySelectorAll('.photoViewer, .photoViewerOnPage, #divMainPhoto');
      console.log(`Nombre de photoViewers trouvés: ${photoViewers.length}`);
      
      photoViewers.forEach((viewer) => {
        // Recherche de l'image principale
        const mainImages = viewer.querySelectorAll('img#fullImg, img.mainImg, .MainPhoto img');
        console.log(`Nombre d'images principales trouvées: ${mainImages.length}`);
        
        mainImages.forEach((img: Element) => {
          const src = img.getAttribute('src');
          const dataSrc = img.getAttribute('data-src');
          console.log('Image source trouvée:', src || dataSrc);
          
          if (src && UrlValidator.isValid(src)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(src);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
          if (dataSrc && UrlValidator.isValid(dataSrc)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(dataSrc);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
        });

        // Recherche dans la galerie de miniatures
        const thumbnails = viewer.querySelectorAll('.thumbPhoto, .Thumbnail img, .thumbnail img');
        console.log(`Nombre de miniatures trouvées: ${thumbnails.length}`);
        
        thumbnails.forEach((thumb: Element) => {
          const src = thumb.getAttribute('src');
          const dataSrc = thumb.getAttribute('data-src');
          const onclick = thumb.getAttribute('onclick');
          
          if (onclick) {
            const match = onclick.match(/showPhoto\('([^']+)'/);
            if (match && match[1]) {
              const imageId = match[1];
              const highQualityUrl = UrlGenerator.createHighQualityUrl(imageId);
              imageUrls.add(highQualityUrl);
              console.log('URL haute qualité générée depuis onclick:', highQualityUrl);
            }
          }
          
          if (src && UrlValidator.isValid(src)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(src);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
          if (dataSrc && UrlValidator.isValid(dataSrc)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(dataSrc);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'extraction depuis PhotoViewer:', error);
    }

    return imageUrls;
  }

  private extractFromGallery(): Set<string> {
    const imageUrls = new Set<string>();
    
    try {
      // Recherche dans toutes les galeries possibles
      const galleries = this.doc.querySelectorAll('.Gallery, .PropertyGallery, .ImageGallery, .gallery');
      console.log(`Nombre de galeries trouvées: ${galleries.length}`);
      
      galleries.forEach((gallery) => {
        const images = gallery.querySelectorAll('img');
        console.log(`Nombre d'images trouvées dans la galerie: ${images.length}`);
        
        images.forEach((img: Element) => {
          const src = img.getAttribute('src');
          const dataSrc = img.getAttribute('data-src');
          
          if (src && UrlValidator.isValid(src)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(src);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
          if (dataSrc && UrlValidator.isValid(dataSrc)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(dataSrc);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'extraction depuis la galerie:', error);
    }

    return imageUrls;
  }

  extract(): string[] {
    console.log('Démarrage de l\'extraction des images');
    
    // Commencer par la méthode du PhotoViewer
    const photoViewerUrls = this.extractFromPhotoViewer();
    console.log(`URLs trouvées dans PhotoViewer: ${photoViewerUrls.size}`);
    
    // Si aucune image n'est trouvée dans le PhotoViewer, essayer la galerie
    const galleryUrls = this.extractFromGallery();
    console.log(`URLs trouvées dans la galerie: ${galleryUrls.size}`);
    
    // Combiner toutes les URLs uniques
    const allUrls = new Set([...photoViewerUrls, ...galleryUrls]);
    
    const uniqueUrls = [...allUrls];
    console.log(`Nombre total d'URLs d'images uniques trouvées: ${uniqueUrls.length}`);
    console.log('URLs des images:', uniqueUrls);
    
    return uniqueUrls;
  }
}
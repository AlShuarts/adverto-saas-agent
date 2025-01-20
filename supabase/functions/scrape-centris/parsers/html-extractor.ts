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
      console.log('Début de l\'extraction des images du PhotoViewer');
      
      // Recherche dans tous les conteneurs possibles d'images
      const containers = [
        '.MainImg',
        '.MainPhoto',
        '.PropertyPhoto',
        '.PropertyGallery',
        '.ImageGallery',
        '.Slideshow',
        '.carouselbox',
        '.carousel-item',
        '#divMainPhoto',
        '.photoViewer',
        '.photoViewerOnPage',
        '.property-thumbnail-container',
        '.property-thumbnail',
        '.property-image',
        '.listing-image',
        '.InspectImageGallery',
        '.InspectImage',
        '.InspectGallery',
        '.GalleryViewer',
        '.GalleryContainer',
        '.PhotoGallery'
      ];
      
      containers.forEach(selector => {
        const elements = this.doc.querySelectorAll(selector);
        console.log(`Recherche dans ${selector}: ${elements.length} éléments trouvés`);
        
        elements.forEach((container) => {
          // Recherche des images dans le conteneur
          const images = container.querySelectorAll('img');
          console.log(`${images.length} images trouvées dans ${selector}`);
          
          images.forEach((img: Element) => {
            const src = img.getAttribute('src');
            const dataSrc = img.getAttribute('data-src');
            const dataOriginal = img.getAttribute('data-original');
            const srcset = img.getAttribute('srcset');
            
            if (src) {
              console.log('Image source trouvée:', src);
              if (UrlValidator.isValid(src)) {
                const cleanedUrl = UrlGenerator.cleanImageUrl(src);
                if (cleanedUrl) imageUrls.add(cleanedUrl);
              }
            }
            
            if (dataSrc) {
              console.log('Data-src trouvé:', dataSrc);
              if (UrlValidator.isValid(dataSrc)) {
                const cleanedUrl = UrlGenerator.cleanImageUrl(dataSrc);
                if (cleanedUrl) imageUrls.add(cleanedUrl);
              }
            }
            
            if (dataOriginal) {
              console.log('Data-original trouvé:', dataOriginal);
              if (UrlValidator.isValid(dataOriginal)) {
                const cleanedUrl = UrlGenerator.cleanImageUrl(dataOriginal);
                if (cleanedUrl) imageUrls.add(cleanedUrl);
              }
            }
            
            if (srcset) {
              console.log('Srcset trouvé:', srcset);
              const urls = srcset.split(',')
                .map(s => s.trim().split(' ')[0])
                .filter(url => UrlValidator.isValid(url))
                .map(url => UrlGenerator.cleanImageUrl(url))
                .filter((url): url is string => url !== null);
              
              urls.forEach(url => imageUrls.add(url));
            }
          });
        });
      });

      // Recherche spécifique des miniatures
      const thumbnails = this.doc.querySelectorAll('.thumbPhoto, .Thumbnail img, .thumbnail img, .thumb img, .gallery-thumb img');
      console.log(`${thumbnails.length} miniatures trouvées`);
      
      thumbnails.forEach((thumb: Element) => {
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
      });

      console.log(`Total d'URLs uniques trouvées: ${imageUrls.size}`);
    } catch (error) {
      console.error('Erreur lors de l\'extraction depuis PhotoViewer:', error);
    }

    return imageUrls;
  }

  private extractFromGallery(): Set<string> {
    const imageUrls = new Set<string>();
    
    try {
      console.log('Début de l\'extraction des images de la galerie');
      
      // Recherche dans toutes les galeries possibles
      const galleries = this.doc.querySelectorAll([
        '.Gallery',
        '.PropertyGallery',
        '.ImageGallery',
        '.gallery',
        '.image-gallery',
        '.photo-gallery',
        '.centris-gallery',
        '.property-gallery',
        '.listing-gallery',
        '.main-gallery',
        '.photo-container'
      ].join(', '));
      
      console.log(`${galleries.length} galeries trouvées`);
      
      galleries.forEach((gallery) => {
        const images = gallery.querySelectorAll('img');
        console.log(`${images.length} images trouvées dans la galerie`);
        
        images.forEach((img: Element) => {
          const src = img.getAttribute('src');
          const dataSrc = img.getAttribute('data-src');
          const srcset = img.getAttribute('srcset');
          const dataOriginal = img.getAttribute('data-original');
          
          if (src && UrlValidator.isValid(src)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(src);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
          
          if (dataSrc && UrlValidator.isValid(dataSrc)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(dataSrc);
            if (cleanedUrl) imageUrls.add(cleanedUrl);
          }
          
          if (srcset) {
            const urls = srcset.split(',')
              .map(s => s.trim().split(' ')[0])
              .filter(url => UrlValidator.isValid(url))
              .map(url => UrlGenerator.cleanImageUrl(url))
              .filter((url): url is string => url !== null);
            
            urls.forEach(url => imageUrls.add(url));
          }
          
          if (dataOriginal && UrlValidator.isValid(dataOriginal)) {
            const cleanedUrl = UrlGenerator.cleanImageUrl(dataOriginal);
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
    
    // Recherche générique d'images
    const allImages = this.doc.querySelectorAll('img[src*="centris.ca"], img[data-src*="centris.ca"]');
    console.log(`Images trouvées avec sélecteur générique: ${allImages.length}`);
    
    allImages.forEach((img: Element) => {
      const src = img.getAttribute('src');
      const dataSrc = img.getAttribute('data-src');
      
      if (src && UrlValidator.isValid(src)) {
        const cleanedUrl = UrlGenerator.cleanImageUrl(src);
        if (cleanedUrl) allUrls.add(cleanedUrl);
      }
      
      if (dataSrc && UrlValidator.isValid(dataSrc)) {
        const cleanedUrl = UrlGenerator.cleanImageUrl(dataSrc);
        if (cleanedUrl) allUrls.add(cleanedUrl);
      }
    });
    
    const uniqueUrls = [...allUrls];
    console.log(`Nombre total d'URLs d'images uniques trouvées: ${uniqueUrls.length}`);
    console.log('URLs des images:', uniqueUrls);
    
    return uniqueUrls;
  }
}
export class ImageParser {
  private doc: any;
  private seenUrls: Set<string>;

  constructor(doc: any) {
    this.doc = doc;
    this.seenUrls = new Set<string>();
    console.log('ImageParser initialized');
  }

  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    return true; // On accepte toutes les URLs pour analyse
  }

  private cleanImageUrl(url: string): string | null {
    try {
      // Recherche d'un ID Centris dans l'URL
      let imageId = null;

      // Format direct media.ashx
      if (url.includes('media.ashx')) {
        const urlObj = new URL(url);
        imageId = urlObj.searchParams.get('id');
      }

      // Recherche d'un ID de 32 caractères hexadécimaux
      if (!imageId) {
        const matches = url.match(/[A-F0-9]{32}/i);
        if (matches && matches[0]) {
          imageId = matches[0];
        }
      }

      if (imageId) {
        return `https://mspublic.centris.ca/media.ashx?id=${imageId}&t=pi&f=I`;
      }

      return null;
    } catch (error) {
      console.log('Erreur lors du nettoyage de l\'URL:', error);
      return null;
    }
  }

  getImageUrls(): string[] {
    console.log('Début de l\'extraction des images');
    const imageUrls = new Set<string>();
    
    // Recherche dans tous les éléments de la page qui pourraient contenir des IDs d'images
    const htmlContent = this.doc.documentElement.innerHTML;
    
    // Recherche de tous les IDs d'images possibles dans le HTML complet
    const idMatches = htmlContent.match(/[A-F0-9]{32}/gi) || [];
    console.log(`Nombre d'IDs d'images trouvés dans le HTML: ${idMatches.length}`);
    
    idMatches.forEach(id => {
      const url = `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&f=I`;
      imageUrls.add(url);
    });

    // Recherche dans les attributs src et data-* des images
    const allImages = this.doc.getElementsByTagName('img');
    console.log(`Nombre total d'éléments img trouvés: ${allImages.length}`);

    for (const img of allImages) {
      const attributes = img.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (this.isValidImageUrl(attr.value)) {
          const cleanedUrl = this.cleanImageUrl(attr.value);
          if (cleanedUrl) {
            imageUrls.add(cleanedUrl);
          }
        }
      }
    }

    // Recherche dans tous les scripts
    const scripts = this.doc.getElementsByTagName('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      const scriptIdMatches = content.match(/[A-F0-9]{32}/gi) || [];
      scriptIdMatches.forEach(id => {
        const url = `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&f=I`;
        imageUrls.add(url);
      });
    }

    // Conversion en tableau et déduplication
    const uniqueUrls = [...imageUrls];
    console.log(`Total d'images uniques trouvées: ${uniqueUrls.length}`);
    return uniqueUrls;
  }
}
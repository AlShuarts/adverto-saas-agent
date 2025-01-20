export class ImageParser {
  private doc: any;
  private seenUrls: Set<string>;

  constructor(doc: any) {
    this.doc = doc;
    this.seenUrls = new Set<string>();
    console.log('ImageParser initialized');
  }

  private isValidImageUrl(url: string): boolean {
    return url && url.includes('mspublic.centris.ca/media');
  }

  private cleanImageUrl(url: string): string | null {
    try {
      // Si l'URL est déjà au bon format, on la retourne directement
      if (url.startsWith('https://mspublic.centris.ca/media.ashx')) {
        const urlObj = new URL(url);
        const id = urlObj.searchParams.get('id');
        if (id && id.length === 32) {
          return url;
        }
      }

      // Recherche d'un ID de 32 caractères hexadécimaux
      const matches = url.match(/[A-F0-9]{32}/i);
      if (matches && matches[0]) {
        return `https://mspublic.centris.ca/media.ashx?id=${matches[0]}&t=pi&f=I`;
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
    
    // Récupérer tout le contenu HTML
    const htmlContent = this.doc.documentElement.innerHTML;
    
    // Rechercher toutes les URLs contenant mspublic.centris.ca/media
    const urlRegex = /https:\/\/mspublic\.centris\.ca\/media[^"'\s)}>]*/g;
    const directUrls = htmlContent.match(urlRegex) || [];
    console.log(`URLs directes trouvées: ${directUrls.length}`);
    
    directUrls.forEach(url => {
      if (this.isValidImageUrl(url)) {
        const cleanedUrl = this.cleanImageUrl(url);
        if (cleanedUrl) imageUrls.add(cleanedUrl);
      }
    });

    // Rechercher tous les IDs d'images possibles dans le HTML
    const idMatches = htmlContent.match(/[A-F0-9]{32}/gi) || [];
    console.log(`IDs d'images trouvés: ${idMatches.length}`);
    
    idMatches.forEach(id => {
      const url = `https://mspublic.centris.ca/media.ashx?id=${id}&t=pi&f=I`;
      imageUrls.add(url);
    });

    // Rechercher dans les attributs des images
    const allImages = this.doc.getElementsByTagName('img');
    console.log(`Éléments img trouvés: ${allImages.length}`);

    for (const img of allImages) {
      const attributes = img.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (this.isValidImageUrl(attr.value)) {
          const cleanedUrl = this.cleanImageUrl(attr.value);
          if (cleanedUrl) imageUrls.add(cleanedUrl);
        }
      }
    }

    // Rechercher dans tous les scripts
    const scripts = this.doc.getElementsByTagName('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      const scriptUrlMatches = content.match(urlRegex) || [];
      scriptUrlMatches.forEach(url => {
        if (this.isValidImageUrl(url)) {
          const cleanedUrl = this.cleanImageUrl(url);
          if (cleanedUrl) imageUrls.add(cleanedUrl);
        }
      });
    }

    const uniqueUrls = [...imageUrls];
    console.log(`Total d'images uniques trouvées: ${uniqueUrls.length}`);
    return uniqueUrls;
  }
}
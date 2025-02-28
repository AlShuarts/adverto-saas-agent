
export class TextParser {
  private doc: any;

  constructor(doc: any) {
    this.doc = doc;
  }

  getTextFromSelectors(selectors: string[]): string {
    for (const selector of selectors) {
      const element = this.doc.querySelector(selector);
      if (!element) continue;
      
      const text = element.textContent?.trim();
      if (text) {
        console.log(`Found text with selector ${selector}:`, text);
        return text;
      }
    }
    return "";
  }

  getElementFromSelectors(selectors: string[]) {
    for (const selector of selectors) {
      const element = this.doc.querySelector(selector);
      if (element) {
        return element;
      }
    }
    return null;
  }

  extractNumber(text: string): number | null {
    const match = text.replace(/\s/g, '').match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  cleanPrice(text: string): number | null {
    const numStr = text.replace(/[^0-9]/g, '');
    return numStr ? parseInt(numStr) : null;
  }

  extractPostalCode(text: string): string | null {
    // Format canadien: A1A 1A1
    const postalCodeRegex = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/;
    const match = text.match(postalCodeRegex);
    return match ? match[0] : null;
  }

  extractPropertyType(text: string): string | null {
    if (!text) return null;
    
    // Types de propriété courants
    const propertyTypes = [
      "Maison unifamiliale", "Condo", "Duplex", "Triplex", 
      "Quadruplex", "Multiplex", "Terrain", "Commercial",
      "Industriel", "Fermette", "Chalet", "Résidentiel"
    ];
    
    for (const type of propertyTypes) {
      if (text.includes(type)) {
        return type;
      }
    }
    
    // Si on ne trouve pas un type exact, on essaie d'extraire des mots-clés
    if (text.includes("unifamiliale") || text.includes("résidence")) {
      return "Maison unifamiliale";
    } else if (text.includes("condo") || text.includes("appartement")) {
      return "Condo";
    } else if (text.includes("plex") || text.includes("logements")) {
      return "Multiplex";
    } else if (text.includes("terrain") || text.includes("lot")) {
      return "Terrain";
    } else if (text.includes("commercial")) {
      return "Commercial";
    }
    
    return "Résidentiel"; // Type par défaut
  }

  extractBedroomsFromDescription(description: string): number | null {
    if (!description) return null;
    
    // Cherche des patterns comme "3 chambres", "3 cc", "3 cac"
    const bedroomRegexes = [
      /(\d+)\s?chambre/i,
      /(\d+)\s?cc/i,
      /(\d+)\s?cac/i,
      /(\d+)\s?ch/i
    ];
    
    for (const regex of bedroomRegexes) {
      const match = description.match(regex);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }
    
    return null;
  }

  extractBathroomsFromDescription(description: string): number | null {
    if (!description) return null;
    
    // Cherche des patterns comme "2 salles de bain", "2 sdb", "2 s.d.b"
    const bathroomRegexes = [
      /(\d+)\s?salle.*bain/i,
      /(\d+)\s?sdb/i,
      /(\d+)\s?s\.d\.b/i,
      /(\d+)\s?s\.d\./i
    ];
    
    for (const regex of bathroomRegexes) {
      const match = description.match(regex);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }
    
    return null;
  }

  extractCityFromAddress(address: string): string | null {
    if (!address) return null;
    
    // Essaie de trouver le format "Ville (Province)"
    const cityRegex = /.*,\s*([A-Za-z\s\-\.]+)(?:\s*\([A-Za-z\s\-\.]+\))?$/;
    const match = address.match(cityRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return null;
  }
}

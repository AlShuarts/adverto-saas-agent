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

  extractNumber(text: string): number | null {
    const match = text.replace(/\s/g, '').match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  cleanPrice(text: string): number | null {
    const numStr = text.replace(/[^0-9]/g, '');
    return numStr ? parseInt(numStr) : null;
  }
}
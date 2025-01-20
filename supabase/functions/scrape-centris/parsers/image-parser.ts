import { HtmlExtractor } from './html-extractor.ts';

export class ImageParser {
  private doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  getImageUrls(): string[] {
    const extractor = new HtmlExtractor(this.doc);
    return extractor.extract();
  }
}
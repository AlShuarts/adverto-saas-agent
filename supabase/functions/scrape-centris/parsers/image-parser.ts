import { HtmlExtractor } from './html-extractor';

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
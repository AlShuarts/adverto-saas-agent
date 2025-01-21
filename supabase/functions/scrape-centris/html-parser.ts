import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { ListingData } from './types.ts';
import { imageSelectors } from './image-selectors.ts';
import { TextParser } from './parsers/text-parser.ts';
import { ImageParser } from './parsers/image-parser.ts';
import { listingSelectors } from './selectors/listing-selectors.ts';

export class HtmlParser {
  private doc: any;
  private textParser: TextParser;
  private imageParser: ImageParser;

  constructor(html: string) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(html, "text/html");
    if (!this.doc) {
      throw new Error("Failed to parse HTML");
    }
    this.textParser = new TextParser(this.doc);
    this.imageParser = new ImageParser(this.doc);
    console.log('HTML parsed successfully');
  }

  getImageUrls(): string[] {
    return this.imageParser.getImageUrls(imageSelectors);
  }

  parseListing(centrisId: string): Omit<ListingData, 'images'> {
    const title = this.textParser.getTextFromSelectors(listingSelectors.title);
    const priceText = this.textParser.getTextFromSelectors(listingSelectors.price);
    const description = this.textParser.getTextFromSelectors(listingSelectors.description);
    const address = this.textParser.getTextFromSelectors(listingSelectors.address);
    const city = this.textParser.getTextFromSelectors(listingSelectors.city);
    const bedroomsText = this.textParser.getTextFromSelectors(listingSelectors.bedrooms);
    const bathroomsText = this.textParser.getTextFromSelectors(listingSelectors.bathrooms);

    return {
      centris_id: centrisId,
      title: title || "Propriété à vendre",
      description: description || null,
      price: priceText ? this.textParser.cleanPrice(priceText) : null,
      address: address || null,
      city: city || null,
      postal_code: null,
      bedrooms: bedroomsText ? this.textParser.extractNumber(bedroomsText) : null,
      bathrooms: bathroomsText ? this.textParser.extractNumber(bathroomsText) : null,
      property_type: "Résidentiel"
    };
  }
}

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
    console.log('Extracting listing data for ID:', centrisId);
    
    // Extraction basique des éléments
    const title = this.textParser.getTextFromSelectors(listingSelectors.title);
    const priceText = this.textParser.getTextFromSelectors(listingSelectors.price);
    const description = this.textParser.getTextFromSelectors(listingSelectors.description);
    const rawAddress = this.textParser.getTextFromSelectors(listingSelectors.address);
    const cityFromSelector = this.textParser.getTextFromSelectors(listingSelectors.city);
    const bedroomsText = this.textParser.getTextFromSelectors(listingSelectors.bedrooms);
    const bathroomsText = this.textParser.getTextFromSelectors(listingSelectors.bathrooms);
    const propertyTypeText = this.textParser.getTextFromSelectors(listingSelectors.property_type);
    const postalCodeText = this.textParser.getTextFromSelectors(listingSelectors.postal_code);

    // Nettoyage de l'adresse pour enlever des préfixes comme "Duplex à vendre"
    const address = this.textParser.cleanAddress(rawAddress);

    console.log('Raw extracted data:', {
      title,
      priceText,
      rawAddress,
      address,
      cityFromSelector,
      bedroomsText,
      bathroomsText,
      propertyTypeText,
      postalCodeText
    });

    // Extraction avancée avec fallbacks
    let bedrooms = bedroomsText ? this.textParser.extractNumber(bedroomsText) : null;
    let bathrooms = bathroomsText ? this.textParser.extractNumber(bathroomsText) : null;
    let postalCode = postalCodeText ? this.textParser.extractPostalCode(postalCodeText) : null;
    let city = cityFromSelector;
    let propertyType = propertyTypeText ? this.textParser.extractPropertyType(propertyTypeText) : null;

    // Fallbacks basés sur la description
    if (!bedrooms && description) {
      bedrooms = this.textParser.extractBedroomsFromDescription(description);
      console.log('Extracted bedrooms from description:', bedrooms);
    }

    if (!bathrooms && description) {
      bathrooms = this.textParser.extractBathroomsFromDescription(description);
      console.log('Extracted bathrooms from description:', bathrooms);
    }

    // Extraction de la ville depuis l'adresse si non trouvée
    if (!city && address) {
      city = this.textParser.extractCityFromAddress(address);
      console.log('Extracted city from address:', city);
    }

    // Extraction du code postal depuis l'adresse si non trouvé
    if (!postalCode && address) {
      postalCode = this.textParser.extractPostalCode(address);
      console.log('Extracted postal code from address:', postalCode);
    }

    // Détermination du type de propriété par défaut
    if (!propertyType) {
      propertyType = "Résidentiel";
    }

    // Nettoyage du prix
    const price = priceText ? this.textParser.cleanPrice(priceText) : null;

    console.log('Final processed data:', {
      title: title || "Propriété à vendre",
      price,
      bedrooms,
      bathrooms,
      address,
      city,
      postalCode,
      propertyType
    });

    return {
      centris_id: centrisId,
      title: title || "Propriété à vendre",
      description: description || null,
      price: price,
      address: address || null,
      city: city || null,
      postal_code: postalCode || null,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      property_type: propertyType
    };
  }
}

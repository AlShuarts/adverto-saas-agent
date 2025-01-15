export interface ListingData {
  centris_id: string;
  title: string;
  description: string | null;
  price: number | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string;
  images: string[] | null;
}

export interface ImageProcessingResult {
  processedUrl: string | null;
  error?: string;
}

export interface ScrapingHeaders {
  'User-Agent': string;
  'Accept': string;
  'Accept-Language': string;
  'Cache-Control': string;
  'Pragma': string;
  'Sec-Ch-Ua': string;
  'Sec-Ch-Ua-Mobile': string;
  'Sec-Ch-Ua-Platform': string;
  'Sec-Fetch-Dest': string;
  'Sec-Fetch-Mode': string;
  'Sec-Fetch-Site': string;
  'Sec-Fetch-User': string;
  'Upgrade-Insecure-Requests': string;
}
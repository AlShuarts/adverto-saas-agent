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
// Shared validation schemas using Zod
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Common validation patterns
const urlPattern = z.string().url().max(2000);
const supabaseStorageUrlPattern = z.string().regex(
  /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\//,
  "Must be a valid Supabase storage URL"
);
const videoUrlPattern = z.string().regex(
  /^https:\/\/([a-z0-9]+\.supabase\.co\/storage\/v1\/|shotstack-api-v1-output\.s3[^.]*\.amazonaws\.com\/)/,
  "Must be a valid Supabase storage URL or Shotstack video URL"
);

// Facebook publish validation
export const facebookPublishSchema = z.object({
  message: z.string().max(63206).trim(), // Facebook's max character limit
  images: z.array(z.string().url().max(2000)).max(10).optional(), // Accept any valid HTTPS URL
  video: z.string().url().max(2000).optional(), // Accept any valid HTTPS URL
  pageId: z.string().min(1).max(100).optional(), // Optional - will be fetched server-side if missing
  accessToken: z.string().min(1).max(1000).optional(), // Optional - will be fetched server-side if missing
});

// Instagram publish validation
export const instagramPublishSchema = z.object({
  message: z.string().max(2200).trim(), // Instagram caption limit
  images: z.array(supabaseStorageUrlPattern).max(10).optional(),
  video: videoUrlPattern.optional(),
  listingId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
});

// Slideshow creation validation
export const slideshowCreateSchema = z.object({
  listingId: z.string().uuid(),
  config: z.object({
    selectedImages: z.array(supabaseStorageUrlPattern).min(1).max(20),
    selectedMusic: z.string().max(200).optional(),
    imageDuration: z.number().min(1).max(10).optional(),
    showDetails: z.boolean().optional(),
    showPrice: z.boolean().optional(),
    showAddress: z.boolean().optional(),
  }),
});

// Banner creation validation
export const bannerCreateSchema = z.object({
  listingId: z.string().uuid(),
  config: z.object({
    mainImage: supabaseStorageUrlPattern,
    brokerImage: supabaseStorageUrlPattern.optional(),
    agencyLogo: supabaseStorageUrlPattern.optional(),
    brokerName: z.string().min(1).max(100),
    brokerEmail: z.string().email().max(255),
    brokerPhone: z.string().min(10).max(20).regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone format"),
    bannerType: z.enum(["VENDU", "A_VENDRE"]).optional(),
  }),
});

// Listing description validation
export const descriptionGenerationSchema = z.object({
  listingId: z.string().uuid().optional(),
  listing: z.object({
    id: z.string().uuid().optional(),
    title: z.string().max(500).nullish(),
    description: z.string().max(5000).nullish(),
    price: z.number().nullish(),
    bedrooms: z.number().nullish(),
    bathrooms: z.number().nullish(),
    address: z.string().max(500).nullish(),
    city: z.string().max(100).nullish(),
    centris_url: z.string().url().nullish(),
    property_type: z.string().max(100).nullish(),
  }).optional(),
  templateId: z.string().uuid().optional(),
  templateContent: z.string().max(10000).optional(),
});

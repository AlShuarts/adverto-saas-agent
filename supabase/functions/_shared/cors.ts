// Allowed origins for CORS - add your production domain(s) here
const allowedOrigins = [
  'https://lovable.dev',
  'https://msmuyhmxlrkcjthugcxd.lovableproject.com',
  'https://immoads.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
];

// Pattern for Lovable preview URLs (e.g., https://preview--projectname.lovable.app)
const lovablePreviewPattern = /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.lovable\.app$/;

// Pattern for Lovable project URLs (e.g., https://uuid.lovableproject.com)
const lovableProjectPattern = /^https:\/\/[a-f0-9-]+\.lovableproject\.com$/;

/**
 * Get CORS headers with origin validation
 * @param request - The incoming request to extract origin from
 * @returns CORS headers object with validated origin
 */
export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers?.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin) || 
                    lovablePreviewPattern.test(origin) || 
                    lovableProjectPattern.test(origin);
  const allowedOrigin = isAllowed ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Legacy export for backward compatibility - use getCorsHeaders(req) for proper origin validation
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

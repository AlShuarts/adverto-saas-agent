import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url || !url.includes('centris.ca')) {
      return new Response(
        JSON.stringify({ error: 'URL invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const response = await fetch(url)
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    if (!doc) {
      throw new Error('Impossible de parser la page')
    }

    // Extract data from the page
    const title = doc.querySelector('h1')?.textContent?.trim() || ''
    const price = doc.querySelector('[data-id="Price"]')?.textContent?.replace(/[^0-9]/g, '') || ''
    const description = doc.querySelector('[data-id="Description"]')?.textContent?.trim() || ''
    const address = doc.querySelector('[data-id="Address"]')?.textContent?.trim() || ''
    const city = doc.querySelector('[data-id="City"]')?.textContent?.trim() || ''
    const postalCode = doc.querySelector('[data-id="PostalCode"]')?.textContent?.trim() || ''
    
    // Get property details
    const bedrooms = doc.querySelector('[data-id="Bedrooms"]')?.textContent?.replace(/[^0-9]/g, '') || ''
    const bathrooms = doc.querySelector('[data-id="Bathrooms"]')?.textContent?.replace(/[^0-9]/g, '') || ''
    const propertyType = doc.querySelector('[data-id="PropertyType"]')?.textContent?.trim() || ''

    // Get images
    const images: string[] = []
    doc.querySelectorAll('[data-id="Photos"] img').forEach((img) => {
      const src = img.getAttribute('src')
      if (src) images.push(src)
    })

    const data = {
      title,
      price: price ? parseInt(price) : null,
      description,
      address,
      city,
      postal_code: postalCode,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      property_type: propertyType,
      images,
      centris_id: url.split('/').pop() || '',
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'extraction des données' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
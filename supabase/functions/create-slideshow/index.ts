
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Shotstack from 'https://esm.sh/shotstack@0.2.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { listingId, config } = await req.json()

    if (!listingId || !config) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Initialize Shotstack
    const client = new Shotstack({
      apiKey: Deno.env.get('SHOTSTACK_API_KEY') ?? '',
      host: 'api.shotstack.io',
      stage: 'production'
    })

    // Create timeline with images
    const clips = (listing.images || []).map((imageUrl, index) => ({
      asset: {
        type: 'image',
        src: imageUrl,
      },
      start: index * config.imageDuration,
      length: config.imageDuration,
      effect: config.transition || 'fade',
      transition: {
        in: 'fade',
        out: 'fade'
      }
    }))

    // Add overlay for price and details if configured
    if (config.showPrice || config.showDetails) {
      const text = []
      if (config.showPrice) {
        text.push(`$${listing.price.toLocaleString()}`)
      }
      if (config.showDetails) {
        text.push(`${listing.bedrooms} ch. | ${listing.bathrooms} sdb.`)
      }
      
      clips.push({
        asset: {
          type: 'html',
          html: `<p style="color: white; font-size: 32px; text-align: center">${text.join('<br>')}</p>`,
          width: 800,
          height: 200,
          background: 'transparent'
        },
        position: 'bottom',
        offset: {
          y: 0.1
        },
        start: 0,
        length: clips.length * config.imageDuration
      })
    }

    const timeline = {
      background: '#000000',
      tracks: [{ clips }]
    }

    // Add soundtrack if provided
    if (config.musicUrl) {
      timeline.soundtrack = {
        src: config.musicUrl,
        effect: 'fadeIn',
        volume: config.musicVolume || 0.5
      }
    }

    const output = {
      format: 'mp4',
      resolution: 'hd'
    }

    // Submit render job
    const render = await client.render({
      timeline,
      output,
      callback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/shotstack-webhook`
    })

    // Save render status
    const { error: renderError } = await supabase
      .from('slideshow_renders')
      .insert({
        listing_id: listingId,
        user_id: req.headers.get('x-user-id'),
        render_id: render.response.id,
        status: 'pending'
      })

    if (renderError) {
      console.error('Error saving render status:', renderError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        renderId: render.response.id,
        message: 'Video rendering started'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting create-slideshow function')
    const { listingId, config } = await req.json()
    console.log('Received request with listingId:', listingId)
    console.log('Config:', config)

    if (!listingId || !config) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const shotstackApiKey = Deno.env.get('SHOTSTACK_API_KEY')
    if (!shotstackApiKey) {
      console.error('SHOTSTACK_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'SHOTSTACK_API_KEY is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fetching listing data')
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      console.error('Error fetching listing:', listingError)
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Create timeline with images
    const clips = (listing.images || []).map((imageUrl: string, index: number) => ({
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
        text.push(`${listing.price.toLocaleString()} $`)
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

    const renderPayload = {
      timeline,
      output: {
        format: 'mp4',
        resolution: 'hd'
      },
      callback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/shotstack-webhook`
    }

    if (config.musicVolume > 0) {
      renderPayload.timeline.soundtrack = {
        src: 'https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/berlin.mp3',
        effect: 'fadeIn',
        volume: config.musicVolume
      }
    }

    console.log('Submitting render job to Shotstack')
    const response = await fetch('https://api.shotstack.io/stage/render', {
      method: 'POST',
      headers: {
        'x-api-key': shotstackApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renderPayload),
    })

    if (!response.ok) {
      throw new Error(`Shotstack API error: ${response.statusText}`)
    }

    const render = await response.json()
    console.log('Render job submitted:', render.response.id)

    // Save render status
    const { error: renderError } = await supabase
      .from('slideshow_renders')
      .insert({
        listing_id: listingId,
        render_id: render.response.id,
        status: 'pending'
      })

    if (renderError) {
      console.error('Error saving render status:', renderError)
      return new Response(
        JSON.stringify({ error: 'Error saving render status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
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
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

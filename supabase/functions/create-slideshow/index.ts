import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting create-slideshow function')
    
    // Get the JWT token from the request headers
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the JWT token
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const { listingId, config } = await req.json()
    console.log('Received request with listingId:', listingId)
    console.log('Config:', config)

    // Validate required parameters
    if (!listingId || !config) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get Shotstack API key
    const shotstackApiKey = Deno.env.get('SHOTSTACK_API_KEY')
    if (!shotstackApiKey) {
      console.error('SHOTSTACK_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'SHOTSTACK_API_KEY is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Using Shotstack API key:', shotstackApiKey.substring(0, 5) + '...')

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

    if (!listing.images || listing.images.length === 0) {
      console.error('No images found for listing')
      return new Response(
        JSON.stringify({ error: 'No images found for listing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create clips with images
    const clips = listing.images.map((imageUrl: string, index: number) => ({
      asset: {
        type: 'image',
        src: imageUrl,
      },
      start: index * config.imageDuration,
      length: config.imageDuration,
      effect: 'zoomIn',
      transition: {
        in: 'fade',
        out: 'fade'
      }
    }))

    // Add text overlays if configured
    if (config.showPrice || config.showDetails) {
      const text = []
      if (config.showPrice) {
        text.push(`${listing.price.toLocaleString()} $`)
      }
      if (config.showDetails && listing.bedrooms && listing.bathrooms) {
        text.push(`${listing.bedrooms} ch. | ${listing.bathrooms} sdb.`)
      }
      
      if (text.length > 0) {
        clips.push({
          asset: {
            type: 'html',
            html: `<p style="color: white; font-size: 32px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${text.join('<br>')}</p>`,
            width: 800,
            height: 200,
            background: 'transparent'
          },
          position: 'bottom',
          offset: {
            y: 0.1
          },
          start: 0,
          length: listing.images.length * config.imageDuration
        })
      }
    }

    // Create render payload
    const renderPayload = {
      timeline: {
        background: '#000000',
        tracks: [{ clips }]
      },
      output: {
        format: 'mp4',
        resolution: 'hd'
      },
      // Use msmuyhmxlrkcjthugcxd as project ID
      callback: `https://msmuyhmxlrkcjthugcxd.supabase.co/functions/v1/shotstack-webhook`
    }

    // Add music if volume > 0
    if (config.musicVolume > 0) {
      renderPayload.timeline.soundtrack = {
        src: 'https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/berlin.mp3',
        effect: 'fadeInFadeOut',
        volume: config.musicVolume
      }
    }

    // Submit render job to Shotstack
    console.log('Submitting render job to Shotstack')
    const response = await fetch('https://api.shotstack.io/stage/render', {
      method: 'POST',
      headers: {
        'x-api-key': shotstackApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renderPayload),
    })

    const responseBody = await response.text()
    console.log('Shotstack response:', responseBody)

    if (!response.ok) {
      throw new Error(`Shotstack API error: ${response.status} ${response.statusText} - ${responseBody}`)
    }

    let renderId;
    try {
      const render = JSON.parse(responseBody)
      renderId = render.response.id
      console.log('Render job submitted:', renderId)
    } catch (error) {
      console.error('Error parsing Shotstack response:', error)
      throw new Error('Invalid response from Shotstack')
    }

    // Save render status with user_id
    const { error: renderError } = await supabase
      .from('slideshow_renders')
      .insert({
        listing_id: listingId,
        render_id: renderId,
        status: 'pending',
        user_id: user.id  // Ajout du user_id
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
        renderId: renderId,
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

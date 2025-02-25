import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const transitions = [
  { in: "slideLeft", out: "slideRight" },
  { in: "slideUp", out: "slideDown" },
  { in: "wipeLeft", out: "wipeRight" },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting create-slideshow function')
    
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const { listingId, config } = await req.json()
    const { selectedImages, infoDisplayConfig } = config

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

    // Create clips array
    const clips = [];
    let totalDuration = 0;

    // Add image clips
    selectedImages.forEach((imageUrl: string, index: number) => {
      const transition = transitions[index % transitions.length];
      clips.push({
        asset: {
          type: 'image',
          src: imageUrl,
        },
        start: totalDuration,
        length: config.imageDuration,
        effect: index % 2 === 0 ? 'zoomIn' : 'zoomOut',
        transition,
      });
      totalDuration += config.imageDuration;
    });

    // Calculate info display timing based on position
    let infoStartTime = 0;
    switch (infoDisplayConfig.position) {
      case 'start':
        infoStartTime = 0;
        break;
      case 'middle':
        infoStartTime = totalDuration / 2 - infoDisplayConfig.duration / 2;
        break;
      case 'end':
        infoStartTime = totalDuration - infoDisplayConfig.duration;
        break;
    }

    // Add information overlays
    if (config.showDetails) {
      if (config.showPrice) {
        clips.push({
          asset: {
            type: 'html',
            html: `<p style="color: white; font-size: 48px; text-align: center; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">${formatPrice(listing.price)}</p>`,
            width: 800,
            height: 100,
          },
          start: infoStartTime,
          length: infoDisplayConfig.duration,
          position: "center",
          offset: {
            y: -0.2
          }
        });
      }

      // Address overlay
      clips.push({
        asset: {
          type: 'html',
          html: `<p style="color: white; font-size: 32px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">${listing.address}</p>`,
          width: 800,
          height: 80,
        },
        start: infoStartTime,
        length: infoDisplayConfig.duration,
        position: "center",
        offset: {
          y: 0
        }
      });

      // Details overlay
      const details = [];
      if (listing.bedrooms) details.push(`${listing.bedrooms} ch.`);
      if (listing.bathrooms) details.push(`${listing.bathrooms} sdb.`);
      if (listing.lot_size) details.push(`${listing.lot_size} pi²`);

      if (details.length > 0) {
        clips.push({
          asset: {
            type: 'html',
            html: `<p style="color: white; font-size: 28px; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">${details.join(' | ')}</p>`,
            width: 800,
            height: 60,
          },
          start: infoStartTime,
          length: infoDisplayConfig.duration,
          position: "center",
          offset: {
            y: 0.2
          }
        });
      }
    }

    // Construct webhook URL with authentication
    const webhookUrl = `https://msmuyhmxlrkcjthugcxd.supabase.co/functions/v1/shotstack-webhook?auth=${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`

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
      callback: webhookUrl
    }

    // Add music if volume > 0
    if (config.musicVolume > 0) {
      renderPayload.timeline.soundtrack = {
        src: 'https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/berlin.mp3',
        effect: 'fadeInFadeOut',
        volume: config.musicVolume
      }
    }

    console.log('Submitting render job to Shotstack with webhook URL:', webhookUrl)
    const response = await fetch('https://api.shotstack.io/v1/render', {
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
        user_id: user.id
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

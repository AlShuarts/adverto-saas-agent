
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
    const { renderId } = await req.json()
    if (!renderId) {
      throw new Error('Missing renderId')
    }

    const shotstackApiKey = Deno.env.get('SHOTSTACK_API_KEY')
    if (!shotstackApiKey) {
      throw new Error('SHOTSTACK_API_KEY is not configured')
    }

    console.log('Checking render status for:', renderId)
    
    const response = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
      method: 'GET',
      headers: {
        'x-api-key': shotstackApiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Shotstack API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Shotstack response:', JSON.stringify(data, null, 2))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Map Shotstack status to our status
    let status = data.response.status;
    if (status === 'done') {
      status = 'completed';
    } else if (status === 'failed') {
      status = 'error';
    }

    // Update render status in database
    if (status === 'completed' || status === 'error') {
      const { error: updateError } = await supabase
        .from('slideshow_renders')
        .update({ 
          status: status,
          video_url: data.response.url,
          updated_at: new Date().toISOString()
        })
        .eq('render_id', renderId)

      if (updateError) {
        throw new Error('Failed to update render status')
      }

      // If render is complete, update the listing
      if (status === 'completed' && data.response.url) {
        const { data: render } = await supabase
          .from('slideshow_renders')
          .select('listing_id')
          .eq('render_id', renderId)
          .single()

        if (render) {
          await supabase
            .from('listings')
            .update({ 
              video_url: data.response.url,
              updated_at: new Date().toISOString()
            })
            .eq('id', render.listing_id)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        status: status,
        url: data.response.url
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

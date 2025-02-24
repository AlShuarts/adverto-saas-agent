
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
    const webhook = await req.json()
    console.log('Received webhook:', webhook)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find the render record
    const { data: render, error: renderError } = await supabase
      .from('slideshow_renders')
      .select('*')
      .eq('render_id', webhook.id)
      .single()

    if (renderError || !render) {
      console.error('Render not found:', webhook.id)
      return new Response(
        JSON.stringify({ error: 'Render not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    console.log('Updating render status:', webhook.status)
    console.log('Video URL:', webhook.url)

    // Update render status
    const { error: updateError } = await supabase
      .from('slideshow_renders')
      .update({ 
        status: webhook.status,
        video_url: webhook.url,
        updated_at: new Date().toISOString()
      })
      .eq('render_id', webhook.id)

    if (updateError) {
      console.error('Error updating render:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update render status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // If render is complete, update the listing
    if (webhook.status === 'done' && webhook.url) {
      console.log('Render completed, updating listing with video URL')
      const { error: listingError } = await supabase
        .from('listings')
        .update({ 
          video_url: webhook.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', render.listing_id)

      if (listingError) {
        console.error('Error updating listing:', listingError)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

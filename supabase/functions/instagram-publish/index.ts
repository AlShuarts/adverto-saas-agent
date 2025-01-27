import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  message: string;
  images: string[];
  listingId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message, images, listingId } = await req.json() as RequestBody
    console.log('Publishing to Instagram:', { message, images: images.length, listingId })

    // Récupérer les informations du profil de l'utilisateur qui fait la requête
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('User not authenticated')
    }

    // Récupérer les informations du profil avec les tokens Instagram
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('instagram_user_id, instagram_access_token')
      .eq('id', user.id)
      .single()

    console.log('Profile data:', { 
      hasProfile: !!profile,
      hasInstagramId: profile?.instagram_user_id,
      hasInstagramToken: profile?.instagram_access_token,
      error: profileError
    })

    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error('Failed to fetch profile')
    }

    if (!profile?.instagram_user_id || !profile?.instagram_access_token) {
      throw new Error('Instagram credentials not found. Please connect your Instagram account in your profile.')
    }

    // Publier sur Instagram
    const firstImage = images[0]
    if (!firstImage) {
      throw new Error('No image provided')
    }

    // 1. Créer un conteneur média
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${profile.instagram_user_id}/media`,
      {
        method: 'POST',
        body: new URLSearchParams({
          image_url: firstImage,
          caption: message,
          access_token: profile.instagram_access_token,
        }),
      }
    )

    const containerData = await containerResponse.json()
    console.log('Container creation response:', containerData)

    if (!containerData.id) {
      console.error('Container creation failed:', containerData)
      throw new Error(containerData.error?.message || 'Failed to create media container')
    }

    // 2. Publier le conteneur
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${profile.instagram_user_id}/media_publish`,
      {
        method: 'POST',
        body: new URLSearchParams({
          creation_id: containerData.id,
          access_token: profile.instagram_access_token,
        }),
      }
    )

    const publishData = await publishResponse.json()
    console.log('Publish response:', publishData)

    if (!publishData.id) {
      console.error('Publishing failed:', publishData)
      throw new Error(publishData.error?.message || 'Failed to publish media')
    }

    // Mettre à jour le statut de publication dans la base de données
    const { error: updateError } = await supabaseClient
      .from('listings')
      .update({
        published_to_instagram: true,
        instagram_post_id: publishData.id
      })
      .eq('id', listingId)

    if (updateError) {
      console.error('Database update failed:', updateError)
      throw new Error('Failed to update listing status')
    }

    return new Response(
      JSON.stringify({ success: true, postId: publishData.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
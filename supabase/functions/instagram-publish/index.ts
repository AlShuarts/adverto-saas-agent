
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { instagramPublishSchema } from '../_shared/validation.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get user's JWT token from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Extract token from Bearer format
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) {
      throw new Error('Invalid authorization header format')
    }

    console.log('Auth token received:', { hasToken: !!token, tokenLength: token.length })

    // Create Supabase client with ANON_KEY to enforce RLS policies
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Parse and validate input
    const rawData = await req.json();
    const validatedData = instagramPublishSchema.parse(rawData);
    const { message, images, video, listingId, templateId } = validatedData;
    
    console.log('Publishing to Instagram:', { 
      messageLength: message?.length, 
      images: images?.length || 0, 
      hasVideo: !!video, 
      listingId, 
      hasTemplate: !!templateId 
    })

    // Get authenticated user - pass the JWT token explicitly
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('User not authenticated')
    }

    // Récupérer les credentials Instagram via fonction SECURITY DEFINER
    const { data: igCreds, error: igError } = await supabaseClient
      .rpc('get_instagram_credentials', { _user_id: user.id })

    console.log('Instagram credentials:', { 
      hasCredentials: !!igCreds && igCreds.length > 0,
      error: igError
    })

    if (igError) {
      console.error('Instagram credentials error:', igError)
      throw new Error('Failed to fetch Instagram credentials')
    }

    if (!igCreds || igCreds.length === 0 || !igCreds[0].instagram_user_id || !igCreds[0].access_token) {
      throw new Error('Instagram credentials not found. Please connect your Instagram account in your profile.')
    }

    const instagramUserId = igCreds[0].instagram_user_id
    const instagramAccessToken = igCreds[0].access_token

    // Récupérer le template s'il est spécifié
    let finalMessage = message;
    if (templateId) {
      const { data: template, error: templateError } = await supabaseClient
        .from('instagram_templates')
        .select('content')
        .eq('id', templateId)
        .single();

      if (templateError || !template) {
        console.warn('Template not found, using original message:', templateError);
      } else {
        console.log('Using template:', template.content);
        finalMessage = template.content;
        
        // Remplacer les variables du template
        const { data: listingData, error: listingError } = await supabaseClient
          .from('listings')
          .select('*')
          .eq('id', listingId)
          .single();
          
        if (!listingError && listingData) {
          // Remplacer les variables dans le template
          finalMessage = finalMessage.replace(/\{price\}/g, listingData.price?.toString() || '');
          finalMessage = finalMessage.replace(/\{address\}/g, listingData.address || '');
          finalMessage = finalMessage.replace(/\{city\}/g, listingData.city || '');
          finalMessage = finalMessage.replace(/\{bedrooms\}/g, listingData.bedrooms?.toString() || '');
          finalMessage = finalMessage.replace(/\{bathrooms\}/g, listingData.bathrooms?.toString() || '');
          finalMessage = finalMessage.replace(/\{description\}/g, message); // Message original comme description
        }
      }
    }

    // Publier sur Instagram
    const caption = (finalMessage || '').slice(0, 2200);
    if (finalMessage && finalMessage.length > 2200) {
      console.warn(`Caption truncated to 2200 chars (was ${finalMessage.length})`);
    }
    if (!video && (!images || !images.length)) {
      throw new Error('No video or images provided')
    }

    let containerData;
    
    if (video) {
      // Publication d'une vidéo (diaporama) - Utiliser REELS au lieu de VIDEO
      console.log('Publishing video to Instagram:', video)
      const createParams = new URLSearchParams({
        media_type: 'REELS',
        video_url: video,
        caption: caption,
        access_token: instagramAccessToken,
      })
      const containerResponse = await fetch(
        `https://graph.facebook.com/v21.0/${instagramUserId}/media`,
        {
          method: 'POST',
          body: createParams,
        }
      )

      if (!containerResponse.ok) {
        const errorText = await containerResponse.text()
        console.error('Video container creation failed:', errorText)
        throw new Error('Failed to create video container')
      }

      containerData = await containerResponse.json()

      if (!containerData.id) {
        console.error('Invalid container response:', containerData)
        throw new Error(containerData.error?.message || 'Failed to create video container')
      }

      // Attendre que le traitement de la vidéo soit terminé avant de publier
      let attempts = 0
      const maxAttempts = 15
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
      while (attempts < maxAttempts) {
        const statusRes = await fetch(
          `https://graph.facebook.com/v21.0/${containerData.id}?fields=status_code,status&access_token=${encodeURIComponent(instagramAccessToken)}`
        )
        const statusData = await statusRes.json()
        console.log(`Video status check [attempt ${attempts + 1}/${maxAttempts}]:`, statusData)
        const statusCode = statusData.status_code || statusData.status
        if (statusCode === 'FINISHED' || statusCode === 'finished' || statusCode === 'READY' || statusCode === 'ready') {
          break
        }
        if (statusCode === 'ERROR' || statusCode === 'error' || statusData.error) {
          throw new Error(statusData.error?.message || 'Video processing failed')
        }
        attempts++
        await delay(2000)
      }
      if (attempts === maxAttempts) {
        throw new Error('Video processing not finished, please try again later')
      }
    } else if (images && images.length === 1) {
      // Publication d'une seule image
      const containerResponse = await fetch(
        `https://graph.facebook.com/v21.0/${instagramUserId}/media`,
        {
          method: 'POST',
          body: new URLSearchParams({
            image_url: images[0],
            caption: caption,
            access_token: instagramAccessToken,
          }),
        }
      )

      containerData = await containerResponse.json()
    } else if (images && images.length > 1) {
      // Publication de plusieurs images (carousel)
      // 1. Créer les conteneurs média pour chaque image
      const mediaResponses = await Promise.all(
        images.map(async (imageUrl) => {
            const response = await fetch(
              `https://graph.facebook.com/v21.0/${instagramUserId}/media`,
              {
                method: 'POST',
                body: new URLSearchParams({
                  image_url: imageUrl,
                  is_carousel_item: 'true',
                  access_token: instagramAccessToken,
                }),
              }
            )
          return response.json()
        })
      )

      console.log('Media container responses:', mediaResponses)

      // Vérifier si tous les conteneurs ont été créés avec succès
      const mediaIds = mediaResponses.map(response => response.id)
      if (mediaIds.some(id => !id)) {
        console.error('Failed to create some media containers:', mediaResponses)
        throw new Error('Failed to process some images')
      }

      // 2. Créer le carousel avec tous les médias
      const carouselResponse = await fetch(
        `https://graph.facebook.com/v21.0/${instagramUserId}/media`,
        {
          method: 'POST',
          body: new URLSearchParams({
            media_type: 'CAROUSEL',
            caption: caption,
            children: mediaIds.join(','),
            access_token: instagramAccessToken,
          }),
        }
      )

      containerData = await carouselResponse.json()
    }

    console.log('Container creation response:', containerData)

    if (!containerData.id) {
      console.error('Container creation failed:', containerData)
      throw new Error(containerData.error?.message || 'Failed to create media container')
    }

    // 3. Publier le conteneur
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramUserId}/media_publish`,
      {
        method: 'POST',
        body: new URLSearchParams({
          creation_id: containerData.id,
          access_token: instagramAccessToken,
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

    // Incrémenter les statistiques d'utilisation pour Instagram
    await supabaseClient.rpc(
      'increment_usage_statistic',
      {
        user_id_param: user.id,
        statistic_type: 'instagram'
      }
    );

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

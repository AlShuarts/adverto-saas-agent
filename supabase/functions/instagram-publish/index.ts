import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { instagramPublishSchema } from '../_shared/validation.ts'

// Utility to wait for a media container to be ready
async function waitForContainerReady(
  containerId: string, 
  accessToken: string, 
  maxWaitMs = 90000, // 90 seconds max
  pollIntervalMs = 3000 // check every 3 seconds
): Promise<{ ready: boolean; error?: string }> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      const statusRes = await fetch(
        `https://graph.facebook.com/v21.0/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`
      );
      const statusData = await statusRes.json();
      
      const statusCode = (statusData.status_code || statusData.status || '').toUpperCase();
      console.log(`Container ${containerId} status check:`, statusData);
      
      if (statusCode === 'FINISHED' || statusCode === 'READY') {
        return { ready: true };
      }
      
      if (statusCode === 'ERROR' || statusData.error) {
        const errorMsg = statusData.error?.message || 'Media processing failed';
        console.error(`Container ${containerId} processing failed:`, statusData);
        return { ready: false, error: errorMsg };
      }
      
      // IN_PROGRESS or other status - wait and retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (err) {
      console.error(`Error checking container ${containerId} status:`, err);
      // Continue polling on network errors
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }
  
  // Timeout reached
  return { 
    ready: false, 
    error: `Instagram is still processing the media after ${maxWaitMs / 1000} seconds. Please try again in a moment.` 
  };
}

// Retry publishing with exponential backoff for transient errors
async function publishWithRetry(
  instagramUserId: string,
  containerId: string,
  accessToken: string,
  maxRetries = 3
): Promise<{ success: boolean; postId?: string; error?: string }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramUserId}/media_publish`,
      {
        method: 'POST',
        body: new URLSearchParams({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();
    console.log(`Publish attempt ${attempt + 1}/${maxRetries}:`, publishData);

    if (publishData.id) {
      return { success: true, postId: publishData.id };
    }

    // Check for "Media not ready" error (code 9007, subcode 2207027)
    if (publishData.error?.code === 9007 || publishData.error?.error_subcode === 2207027) {
      console.log(`Media not ready yet, waiting before retry...`);
      // Wait progressively longer: 5s, 10s, 15s
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 5000));
      continue;
    }

    // Other error - don't retry
    return { 
      success: false, 
      error: publishData.error?.message || 'Failed to publish media' 
    };
  }

  return { 
    success: false, 
    error: 'Media is still being processed by Instagram. Please try again in 30-60 seconds.' 
  };
}

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
    console.log('instagram-publish called with raw body:', { 
      hasMessage: !!rawData.message, 
      imagesCount: rawData.images?.length || 0, 
      hasVideo: !!rawData.video,
      listingId: rawData.listingId,
      templateId: rawData.templateId
    });
    
    const validatedData = instagramPublishSchema.parse(rawData);
    let { message, images, video, listingId, templateId } = validatedData;
    
    // Validation : Instagram limite à 10 images
    if (images && images.length > 10) {
      console.warn(`Too many images for Instagram (${images.length}), truncating to 10`);
      images = images.slice(0, 10);
    }
    
    console.log('Publishing to Instagram (validated):', { 
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

    let containerData: { id?: string; error?: { message?: string } } | undefined;
    
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

      if (!containerData?.id) {
        console.error('Invalid container response:', containerData)
        throw new Error(containerData?.error?.message || 'Failed to create video container')
      }

      // Wait for video processing to complete
      console.log('Waiting for video container to be ready...');
      const videoReadyResult = await waitForContainerReady(containerData.id, instagramAccessToken);
      
      if (!videoReadyResult.ready) {
        throw new Error(videoReadyResult.error || 'Video processing timed out');
      }
      console.log('Video container is ready for publishing');
      
    } else if (images && images.length === 1) {
      // Publication d'une seule image
      console.log('Publishing single image to Instagram');
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
      
      if (!containerData?.id) {
        console.error('Single image container creation failed:', containerData)
        throw new Error(containerData?.error?.message || 'Failed to create image container')
      }

      // Wait for single image to be ready
      console.log('Waiting for image container to be ready...');
      const imageReadyResult = await waitForContainerReady(containerData.id, instagramAccessToken, 60000);
      
      if (!imageReadyResult.ready) {
        throw new Error(imageReadyResult.error || 'Image processing timed out');
      }
      console.log('Image container is ready for publishing');
      
    } else if (images && images.length > 1) {
      // Publication de plusieurs images (carousel)
      console.log(`Publishing carousel with ${images.length} images to Instagram`);
      
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
        const failedResponse = mediaResponses.find(r => !r.id);
        throw new Error(failedResponse?.error?.message || 'Failed to process some images')
      }

      // 2. WAIT for ALL carousel item containers to be ready
      console.log('Waiting for all carousel item containers to be ready...');
      for (let i = 0; i < mediaIds.length; i++) {
        const readyResult = await waitForContainerReady(mediaIds[i], instagramAccessToken, 60000);
        if (!readyResult.ready) {
          throw new Error(`Carousel image ${i + 1} processing failed: ${readyResult.error}`);
        }
        console.log(`Carousel item ${i + 1}/${mediaIds.length} is ready`);
      }

      // 3. Créer le carousel avec tous les médias
      console.log('Creating carousel container...');
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
      
      if (!containerData?.id) {
        console.error('Carousel container creation failed:', containerData)
        throw new Error(containerData?.error?.message || 'Failed to create carousel container')
      }

      // 4. Wait for carousel container to be ready
      console.log('Waiting for carousel container to be ready...');
      const carouselReadyResult = await waitForContainerReady(containerData.id, instagramAccessToken, 60000);
      
      if (!carouselReadyResult.ready) {
        throw new Error(carouselReadyResult.error || 'Carousel processing timed out');
      }
      console.log('Carousel container is ready for publishing');
    }

    console.log('Container ready for publishing:', containerData?.id)

    if (!containerData?.id) {
      throw new Error('No media container created')
    }

    // 3. Publier le conteneur avec retry logic
    console.log('Publishing media...');
    const publishResult = await publishWithRetry(instagramUserId, containerData.id, instagramAccessToken);

    if (!publishResult.success) {
      console.error('Publishing failed after retries:', publishResult.error);
      // Return a structured error for the frontend
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'MEDIA_NOT_READY',
          message: publishResult.error,
          retryAfterSeconds: 30
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 422, // Unprocessable Entity - indicates a retryable condition
        }
      )
    }

    console.log('Published successfully with post ID:', publishResult.postId);

    // Mettre à jour le statut de publication dans la base de données
    const { error: updateError } = await supabaseClient
      .from('listings')
      .update({
        published_to_instagram: true,
        instagram_post_id: publishResult.postId
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
      JSON.stringify({ success: true, postId: publishResult.postId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

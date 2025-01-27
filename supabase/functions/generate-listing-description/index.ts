import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listing } = await req.json();

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    // Fetch user's profile to get their example post
    const { data: profile } = await supabase
      .from('profiles')
      .select('facebook_post_example')
      .eq('id', listing.user_id)
      .single();

    // Créer un titre descriptif basé sur les caractéristiques de la propriété
    const propertyTitle = `${listing.bedrooms ? `${listing.bedrooms} chambres` : ''} ${listing.property_type || ''} ${listing.city ? `à ${listing.city}` : ''}`.trim();

    let prompt = `Génère un texte de vente accrocheur en français pour cette propriété immobilière. 
    Utilise ces informations:
    - Type: ${propertyTitle}
    - Prix: ${listing.price ? listing.price.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }) : 'Prix sur demande'}
    - Adresse: ${[listing.address, listing.city].filter(Boolean).join(', ')}
    ${listing.bedrooms ? `- ${listing.bedrooms} chambres` : ''}
    ${listing.bathrooms ? `- ${listing.bathrooms} salles de bain` : ''}
    ${listing.description ? `- Description additionnelle: ${listing.description}` : ''}
    - Courtier: ${listing.title}`;

    // Add example post to prompt if available
    if (profile?.facebook_post_example) {
      prompt += `\n\nVoici un exemple du style d'annonce que le courtier utilise habituellement. Essaie de reproduire ce style:\n${profile.facebook_post_example}`;
    }

    prompt += `\n\nLe texte doit:
    1. Être accrocheur et professionnel
    2. Mettre en valeur les points forts de la propriété
    3. Inclure le prix et l'adresse
    4. Ne pas dépasser 300 caractères
    5. Inclure des émojis pertinents
    6. Mentionner le courtier à la fin
    7. Terminer par "Plus de détails sur ${listing.centris_url}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Tu es un expert en marketing immobilier qui écrit des textes de vente accrocheurs.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify({ 
      text: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
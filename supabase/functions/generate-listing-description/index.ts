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
    const { listing, selectedTemplateId } = await req.json();

    const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

    let templateContent = '';
    if (selectedTemplateId && selectedTemplateId !== 'none') {
      const { data: template } = await supabase
        .from('facebook_templates')
        .select('content')
        .eq('id', selectedTemplateId)
        .single();
      
      if (template) {
        templateContent = template.content;
      }
    } else {
      // Fetch user's profile to get their example post
      const { data: profile } = await supabase
        .from('profiles')
        .select('facebook_post_example')
        .eq('id', listing.user_id)
        .single();

      templateContent = profile?.facebook_post_example || '';
    }

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

    if (templateContent) {
      prompt += `\n\nVoici un exemple du style d'annonce à suivre. Essaie de reproduire ce style:\n${templateContent}`;
    }

    prompt += `\n\nLe texte doit:
    1. Être accrocheur et professionnel
    2. Mettre en valeur les points forts de la propriété
    3. Inclure le prix et l'adresse
    4. Utiliser des sauts de ligne pour aérer le texte
    5. Séparer clairement les différentes sections (description, caractéristiques, prix, etc.)
    6. Inclure des émojis pertinents au début de chaque section
    7. Mentionner le courtier à la fin
    8. Terminer uniquement avec "Plus de détails sur ${listing.centris_url}"
    
    Format souhaité:
    [Titre accrocheur avec émoji]
    
    [Description courte et accrocheuse]
    
    ✨ Caractéristiques principales:
    • [Point 1]
    • [Point 2]
    • [Point 3]
    
    💰 Prix: [prix]
    📍 Emplacement: [adresse]
    
    👤 [Mention du courtier]
    
    Plus de détails sur ${listing.centris_url}

    IMPORTANT: Ne pas répéter le lien Centris dans le texte, il doit apparaître uniquement à la fin.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en marketing immobilier qui écrit des textes de vente accrocheurs avec une mise en page claire et aérée. Ne jamais répéter le lien Centris, il doit apparaître une seule fois à la fin du texte.' 
          },
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

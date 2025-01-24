import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const prompt = `Génère un texte de vente accrocheur en français pour cette propriété immobilière. 
    Utilise ces informations:
    - Titre: ${listing.title}
    - Prix: ${listing.price ? listing.price.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }) : 'Prix sur demande'}
    - Adresse: ${[listing.address, listing.city].filter(Boolean).join(', ')}
    ${listing.bedrooms ? `- ${listing.bedrooms} chambres` : ''}
    ${listing.bathrooms ? `- ${listing.bathrooms} salles de bain` : ''}
    ${listing.description ? `- Description additionnelle: ${listing.description}` : ''}

    Le texte doit:
    1. Être accrocheur et professionnel
    2. Mettre en valeur les points forts de la propriété
    3. Inclure le prix et l'adresse
    4. Ne pas dépasser 300 caractères
    5. Inclure des émojis pertinents
    6. Terminer par "Plus de détails sur ${listing.centris_url}"`;

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
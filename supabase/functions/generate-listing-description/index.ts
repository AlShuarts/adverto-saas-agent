
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Vérification de l'authentification
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Pas d'en-tête d'autorisation.");
    }

    // Create Supabase client with SERVICE_ROLE_KEY
    // This function doesn't access sensitive user data, so SERVICE_ROLE is safe
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Jeton utilisateur invalide.");
    }

    const body = await req.json();
    let listing;
    let templateContent;
    
    // Handle different request formats
    if (body.listing) {
      // Direct listing object in request
      listing = body.listing;
      templateContent = body.templateContent;
    } else if (body.listingId) {
      // Just listing ID provided, fetch listing from database
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', body.listingId)
        .single();
        
      if (listingError || !listingData) {
        throw new Error("Impossible de trouver l'annonce.");
      }
      
      listing = listingData;
      
      // If templateId is provided, fetch the template
      if (body.templateId && body.templateId !== "none") {
        const { data: template } = await supabase
          .from('facebook_templates')
          .select('content')
          .eq('id', body.templateId)
          .single();
          
        if (template) {
          templateContent = template.content;
        }
      }
    } else {
      throw new Error("Format de requête invalide. Listing ou listingId requis.");
    }

    console.log("Received template content:", templateContent);

    if (!listing) {
      throw new Error("Données de l'annonce manquantes.");
    }

    const propertyTitle = `${listing.bedrooms ? `${listing.bedrooms} chambres` : ''} ${listing.property_type || ''} ${listing.city ? `à ${listing.city}` : ''}`.trim();

    let prompt;
    if (templateContent) {
      prompt = `Voici un template de texte pour une annonce immobilière:

${templateContent}

Utilise EXACTEMENT le même format, la même structure et le même style que ce template, mais remplace les informations par celles de cette propriété:
- Type: ${propertyTitle}
- Prix: ${listing.price ? listing.price.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }) : 'Prix sur demande'}
- Adresse: ${[listing.address, listing.city].filter(Boolean).join(', ')}
${listing.bedrooms ? `- ${listing.bedrooms} chambres` : ''}
${listing.bathrooms ? `- ${listing.bathrooms} salles de bain` : ''}
${listing.description ? `- Description additionnelle: ${listing.description}` : ''}
- Courtier: ${listing.title}

INSTRUCTIONS IMPORTANTES:
1. Garde EXACTEMENT la même structure que le template
2. Utilise les mêmes émojis aux mêmes endroits
3. Garde le même style d'écriture et le même ton
4. Remplace uniquement les informations spécifiques à la propriété
5. Termine avec "Plus de détails sur ${listing.centris_url}"`;
    } else {
      // Si pas de template, utiliser le format par défaut
      prompt = `Génère un texte de vente accrocheur en français pour cette propriété immobilière. 
      Utilise ces informations:
      - Type: ${propertyTitle}
      - Prix: ${listing.price ? listing.price.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }) : 'Prix sur demande'}
      - Adresse: ${[listing.address, listing.city].filter(Boolean).join(', ')}
      ${listing.bedrooms ? `- ${listing.bedrooms} chambres` : ''}
      ${listing.bathrooms ? `- ${listing.bathrooms} salles de bain` : ''}
      ${listing.description ? `- Description additionnelle: ${listing.description}` : ''}
      - Courtier: ${listing.title}

      Le texte doit:
      1. Être accrocheur et professionnel
      2. Mettre en valeur les points forts de la propriété
      3. Inclure le prix et l'adresse
      4. Utiliser des sauts de ligne pour aérer le texte
      5. Séparer clairement les différentes sections
      6. Inclure des émojis pertinents au début de chaque section
      7. Ne pas écrire en caractère gras et ne pas utiliser de * 
      8. Mentionner le courtier à la fin
      9. Terminer avec "Plus de détails sur ${listing.centris_url}"`;
    }

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: templateContent 
              ? 'Tu es un expert en immobilier qui doit adapter un template existant en remplaçant uniquement les informations spécifiques tout en gardant EXACTEMENT la même structure, le même style et le même format. Ne change pas la mise en forme, les émojis ou le style d\'écriture du template.' 
              : 'Tu es un expert en marketing immobilier qui écrit des textes de vente accrocheurs.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: templateContent ? 0.3 : 0.7, // Température plus basse pour mieux suivre le template
      }),
    });

    const data = await response.json();

    // Mise à jour des statistiques d'utilisation
    try {
      const { error: statError } = await supabase.rpc(
        'increment_usage_statistic',
        {
          user_id_param: user.id,
          statistic_type: 'description'
        }
      );

      if (statError) {
        console.error("Erreur lors de la mise à jour des statistiques:", statError);
      }
    } catch (statErr) {
      console.error("Exception lors de la mise à jour des statistiques:", statErr);
    }

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

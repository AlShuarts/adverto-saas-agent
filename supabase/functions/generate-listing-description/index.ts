
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { descriptionGenerationSchema } from "../_shared/validation.ts";

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
    // Vérification de la clé OpenAI
    if (!openAIApiKey) {
      console.error("❌ OPENAI_API_KEY n'est pas configurée.");
      return new Response(JSON.stringify({ error: "Configuration serveur manquante." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vérification de l'authentification
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("❌ Pas d'en-tête Authorization.");
      return new Response(JSON.stringify({ error: "Pas d'en-tête d'autorisation." }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extraire le JWT du header Authorization
    const jwt = authHeader.replace("Bearer ", "").trim();
    if (!jwt) {
      console.error("❌ JWT vide dans Authorization header.");
      return new Response(JSON.stringify({ error: "Jeton d'autorisation invalide." }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client for user-scoped reads (RLS enforced)
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Create Supabase client with SERVICE_ROLE_KEY for privileged operations (e.g., RPC stats)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Passer explicitement le JWT à getUser()
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(jwt);

    if (userError || !user) {
      console.error("❌ Invalid or expired user token:", userError);
      return new Response(JSON.stringify({ error: "Jeton utilisateur invalide ou expiré." }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("✅ Authenticated user:", user.id);

    // Parse and validate input
    const rawData = await req.json();
    const validatedData = descriptionGenerationSchema.parse(rawData);
    
    let listing;
    let templateContent = validatedData.templateContent;
    
    // Handle different request formats
    if (validatedData.listing) {
      listing = validatedData.listing;

      try {
        if (validatedData.listing.id) {
          const { data: reloaded, error: reloadError } = await supabaseUser
            .from('listings')
            .select('*')
            .eq('id', validatedData.listing.id)
            .maybeSingle();

          if (!reloadError && reloaded) {
            listing = reloaded;
          }
        }
      } catch (e) {
        console.warn("⚠️ Failed to reload listing via RLS, using provided object.");
      }
    } else if (validatedData.listingId) {
      const { data: listingData, error: listingError } = await supabaseUser
        .from('listings')
        .select('*')
        .eq('id', validatedData.listingId)
        .maybeSingle();
        
      if (listingError || !listingData) {
        throw new Error("Impossible de trouver l'annonce.");
      }
      
      listing = listingData;
      
      // If templateId is provided, fetch the template
      if (validatedData.templateId && validatedData.templateId !== "none") {
        const { data: template } = await supabaseUser
          .from('facebook_templates')
          .select('content')
          .eq('id', validatedData.templateId)
          .maybeSingle();
          
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
    const formattedPrice = (listing.price !== null && listing.price !== undefined)
      ? new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(listing.price))
      : 'Prix sur demande';

    let prompt;
    if (templateContent) {
      prompt = `Voici un template de texte pour une annonce immobilière:

${templateContent}

Utilise EXACTEMENT le même format, la même structure et le même style que ce template, mais remplace les informations par celles de cette propriété.

INFORMATIONS PRINCIPALES (à utiliser en priorité):
Description complète de la propriété:
${listing.description || 'Aucune description fournie'}

INFORMATIONS COMPLÉMENTAIRES:
- Type: ${propertyTitle}
- Prix: ${formattedPrice}
- Adresse: ${[listing.address, listing.city].filter(Boolean).join(', ')}
${listing.bedrooms ? `- ${listing.bedrooms} chambres` : ''}
${listing.bathrooms ? `- ${listing.bathrooms} salles de bain` : ''}
- Courtier: ${listing.title}

INSTRUCTIONS CRITIQUES:
1. UTILISE EN PRIORITÉ les informations de la "Description complète de la propriété" ci-dessus
2. Corrige TOUTES les fautes d'orthographe et de grammaire présentes dans la description originale
3. Garde EXACTEMENT la même structure que le template
4. Utilise les mêmes émojis aux mêmes endroits
5. Garde le même style d'écriture et le même ton
6. Assure-toi que le texte final est PARFAIT sur le plan linguistique (orthographe, grammaire, ponctuation)
7. Termine avec "Plus de détails sur ${listing.centris_url}"`;
    } else {
      // Si pas de template, utiliser le format par défaut
      prompt = `Génère un texte de vente accrocheur en français pour cette propriété immobilière.

DESCRIPTION COMPLÈTE DE LA PROPRIÉTÉ (source principale - à utiliser en priorité):
${listing.description || 'Aucune description fournie - utilise les informations ci-dessous'}

INFORMATIONS COMPLÉMENTAIRES:
- Type: ${propertyTitle}
- Prix: ${formattedPrice}
- Adresse: ${[listing.address, listing.city].filter(Boolean).join(', ')}
${listing.bedrooms ? `- ${listing.bedrooms} chambres` : ''}
${listing.bathrooms ? `- ${listing.bathrooms} salles de bain` : ''}
- Courtier: ${listing.title}

INSTRUCTIONS CRITIQUES:
1. BASE-TOI PRINCIPALEMENT sur la "Description complète de la propriété" ci-dessus
2. CORRIGE toutes les fautes d'orthographe et de grammaire de la description originale
3. Enrichis le contenu avec les informations complémentaires si nécessaire
4. Le texte doit être accrocheur et professionnel
5. Mettre en valeur les points forts de la propriété
6. Inclure le prix et l'adresse
7. Utiliser des sauts de ligne pour aérer le texte
8. Séparer clairement les différentes sections
9. Inclure des émojis pertinents au début de chaque section
10. Ne pas écrire en caractère gras et ne pas utiliser de *
11. Assure-toi que le français est PARFAIT (grammaire, orthographe, ponctuation, conjugaison)
12. Mentionner le courtier à la fin
13. Terminer avec "Plus de détails sur ${listing.centris_url}"`;
    }

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: templateContent 
              ? 'Tu es un expert en immobilier et un correcteur professionnel. Tu dois adapter un template existant en remplaçant les informations tout en gardant EXACTEMENT la même structure. IMPORTANT: Corrige systématiquement toutes les fautes d\'orthographe, de grammaire et de ponctuation. Le texte final doit être linguistiquement parfait.' 
              : 'Tu es un expert en marketing immobilier et un correcteur professionnel. Tu écris des textes de vente accrocheurs en français impeccable. IMPORTANT: Corrige systématiquement toutes les fautes d\'orthographe, de grammaire et de ponctuation. Le français doit être parfait.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: templateContent ? 0.3 : 0.7,
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Log pour vérifier la qualité
    console.log("✅ Texte généré (longueur:", generatedText.length, "caractères)");
    console.log("📝 Utilisation de la description:", listing.description ? "OUI" : "NON");

    // Mise à jour des statistiques d'utilisation
    try {
      const { error: statError } = await supabaseService.rpc(
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
      text: generatedText 
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

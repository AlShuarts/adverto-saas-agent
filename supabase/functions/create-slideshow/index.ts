import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔹 Démarrage de la fonction create-slideshow");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("❌ Pas d'en-tête d'autorisation.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      throw new Error("❌ Jeton utilisateur invalide.");
    }

    const { listingId, config } = await req.json();
    const { selectedImages, infoDisplayConfig } = config;

    if (!listingId || !config) {
      return new Response(
        JSON.stringify({ error: "❌ Paramètres requis manquants." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("📜 Configuration reçue:", JSON.stringify(config, null, 2));
    console.log("🖼️ Images sélectionnées:", selectedImages);

    console.log("📡 Récupération des données du listing.");
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      console.error("❌ Erreur lors de la récupération du listing:", listingError);
      return new Response(
        JSON.stringify({ error: "❌ Listing non trouvé." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const clips = [];
    let totalDuration = 0;
    const effects = ["slideLeftSlow", "slideRightSlow"];
    const textElements = [];

    // Préparer les informations à afficher
    if (config.showDetails) {
      if (config.showPrice && listing.price) {
        textElements.push(formatPrice(listing.price));
      }
      if (config.showAddress && listing.address) {
        let address = listing.address;
        if (listing.city) {
          address += `, ${listing.city}`;
        }
        if (listing.postal_code) {
          address += ` ${listing.postal_code}`;
        }
        textElements.push(address);
      }
      const details = [];
      if (listing.bedrooms) details.push(`${listing.bedrooms} ch.`);
      if (listing.bathrooms) details.push(`${listing.bathrooms} sdb.`);
      if (listing.property_type) details.push(listing.property_type);
      if (details.length > 0) {
        textElements.push(details.join(" | "));
      }
    }

    // Ajouter les images et les textes associés
    selectedImages.forEach((imageUrl: string, index: number) => {
      const effect = effects[index % effects.length];
      const imageClip = {
        asset: {
          type: 'image',
          src: imageUrl,
        },
        start: totalDuration,
        length: config.imageDuration,
        effect: effect,
      };
      clips.push(imageClip);

      // Ajouter le texte correspondant si disponible
      if (textElements[index]) {
        const textClip = {
          asset: {
            type: "text",
            text: textElements[index],
            width: 1000,
            height: 100,
            font: {
              family: "Poppins",
              color: "#ffffff",
              opacity: 0.8,
              size: 40,
              weight: 400,
              lineHeight: 1.0,
            },
            background: {
              color: "#000000",
              opacity: 0.5,
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
          },
          start: totalDuration,
          length: config.imageDuration,
          offset: {
              x: 0,
              y: -0.05
            },
        };
        clips.push(textClip);
      }

      totalDuration += config.imageDuration;
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
    const webhookUrl = `${supabaseUrl}/functions/v1/shotstack-webhook`;
    
    console.log("🔗 URL du webhook configurée:", webhookUrl);

    const renderPayload = {
      timeline: { background: "#000000", tracks: [{ clips }] },
      output: { format: "mp4", resolution: "hd" },
      callback: webhookUrl,
    };

    console.log("📤 Payload Shotstack:", JSON.stringify(renderPayload, null, 2));
    console.log("🚀 Envoi du rendu à Shotstack.");
    const response = await fetch("https://api.shotstack.io/v1/render", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("SHOTSTACK_API_KEY") ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(renderPayload),
    });

    console.log("✅ Statut de Shotstack:", response.status);
    const responseData = await response.json();
    console.log("📝 Réponse de Shotstack:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    const renderId = responseData.response?.id;
    if (!renderId) {
      throw new Error("❌ Réponse invalide de Shotstack.");
    }
    
    // Créer un enregistrement dans notre base de données pour suivre ce rendu
    console.log("💾 Création d'un enregistrement pour le rendu:", renderId);
    const { error: insertError } = await supabase
      .from("slideshow_renders")
      .insert({
        listing_id: listingId,
        render_id: renderId,
        status: "pending",
        user_id: user.id,  // Ajout de l'ID utilisateur
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error("❌ Erreur lors de l'enregistrement du rendu:", insertError);
      throw new Error(`Erreur lors de l'enregistrement du rendu: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, renderId, message: "Vidéo en cours de génération." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("⚠️ Erreur:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

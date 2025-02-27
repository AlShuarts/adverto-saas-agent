import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "@supabase/supabase-js";
import { generate } from "https://deno.land/x/deno_graph@0.48.0/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { listingId, config } = await req.json();

    if (!listingId) {
      throw new Error("listingId is required");
    }

    // 1. Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (!user) {
      throw new Error("Could not find user");
    }

    // 2. Generate a unique render ID
    const renderId = crypto.randomUUID();

    // Create a record in our database to track this render
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

    // 3. Start the render
    const payload = {
      renderId,
      listingId,
      config,
    };

    const queueUrl = Deno.env.get("DENO_KV_QUEUE_URL");
    if (!queueUrl) {
      throw new Error("DENO_KV_QUEUE_URL is required");
    }

    console.log("✉️  Envoi du message à la queue:", payload);
    const res = await fetch(queueUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("❌ Erreur lors de l'envoi du message à la queue:", res);
      throw new Error(`Erreur lors de l'envoi du message à la queue: ${res.statusText}`);
    }

    console.log("✅ Message envoyé à la queue avec succès.");

    return new Response(
      JSON.stringify({
        renderId,
        status: "pending",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("🔥", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

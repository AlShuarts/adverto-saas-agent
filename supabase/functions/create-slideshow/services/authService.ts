
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export const validateUser = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error("❌ Pas d'en-tête d'autorisation.");
  }

  // Extraire le token JWT de l'en-tête Authorization
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new Error("❌ Jeton manquant dans l'en-tête Authorization");
  }

  // Use ANON_KEY with user's JWT to enforce RLS policies
  const supabase = createClient(
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

  // Passer explicitement le token à getUser()
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError) {
    console.error("❌ Erreur d'authentification:", userError);
    throw new Error(`❌ Jeton utilisateur invalide: ${userError.message}`);
  }

  if (!user) {
    console.error("❌ Aucun utilisateur trouvé dans le jeton");
    throw new Error("❌ Jeton utilisateur invalide: aucun utilisateur trouvé");
  }
  
  console.log("✅ Utilisateur authentifié:", user.id);

  // Create service role client for system operations (not user data access)
  const supabaseServiceRole = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  return { user, supabase, supabaseServiceRole };
};

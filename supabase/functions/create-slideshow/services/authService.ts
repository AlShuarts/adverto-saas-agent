
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export const validateUser = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error("❌ Pas d'en-tête d'autorisation.");
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

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("❌ Jeton utilisateur invalide.");
  }

  // Create service role client for system operations (not user data access)
  const supabaseServiceRole = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  return { user, supabase, supabaseServiceRole };
};

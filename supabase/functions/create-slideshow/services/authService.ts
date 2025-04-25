
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export const validateUser = async (authHeader: string | null) => {
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

  return { user, supabase };
};

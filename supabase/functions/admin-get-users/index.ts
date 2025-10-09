
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupération de l'ID utilisateur à partir du token
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      throw new Error("Jeton utilisateur invalide.");
    }

    // Vérifier si l'utilisateur est admin via la fonction has_role
    const { data: isAdminData, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdminData) {
      return new Response(
        JSON.stringify({ error: "Vous n'avez pas les droits d'administrateur." }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les statistiques d'utilisation
    const { data: stats, error: statsError } = await supabase
      .from('usage_statistics')
      .select('*');

    if (statsError) {
      throw statsError;
    }

    // Récupérer la liste des utilisateurs avec l'API admin
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      throw authUsersError;
    }

    console.log("Utilisateurs récupérés:", authUsers.users.length);

    // Récupérer les profils des utilisateurs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      throw profilesError;
    }

    console.log("Profils récupérés:", profiles.length);

    // Combiner les données des utilisateurs, profils et statistiques
    const combined = stats.map(stat => {
      // Trouver l'utilisateur correspondant dans auth.users
      const authUser = authUsers.users.find(u => u.id === stat.user_id);
      
      // Trouver le profil correspondant
      const userProfile = profiles.find(p => p.id === stat.user_id);
      
      return {
        ...stat,
        email: authUser ? authUser.email : 'Inconnu',
        first_name: userProfile ? userProfile.first_name : 'Inconnu',
        last_name: userProfile ? userProfile.last_name : ''
      };
    });

    console.log("Données combinées prêtes à être envoyées:", combined.length);

    return new Response(
      JSON.stringify(combined),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

export type UsageStatistic = {
  id: string;
  user_id: string;
  description_generations: number;
  slideshow_generations: number;
  created_at: string;
  updated_at: string;
  // Informations jointes du profil utilisateur
  email?: string;
  first_name?: string;
  last_name?: string;
};

export const useAdmin = () => {
  const { profile } = useProfile();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statistics, setStatistics] = useState<UsageStatistic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!profile) return;

      try {
        // Vérifier si l'utilisateur est admin
        if (profile.role === 'admin') {
          setIsAdmin(true);
          // Si admin, charger les statistiques
          await fetchStatistics();
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du statut d'admin:", err);
        setError("Impossible de vérifier les droits d'administration");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [profile]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer les statistiques d'utilisation
      const { data: stats, error: statsError } = await supabase
        .from('usage_statistics')
        .select('*')
        .order('description_generations', { ascending: false });

      if (statsError) throw statsError;

      // Récupérer les informations des utilisateurs pour les lier aux statistiques
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      
      if (usersError) throw usersError;

      // Récupérer les emails des utilisateurs (nécessite un rôle admin)
      const { data: authUsers, error: authError } = await supabase
        .rpc('admin_get_users');

      const enrichedStats = stats.map(stat => {
        const userProfile = users.find(u => u.id === stat.user_id);
        const authUser = authError ? null : (authUsers || []).find((u: any) => u.id === stat.user_id);
        
        return {
          ...stat,
          first_name: userProfile?.first_name || 'Inconnu',
          last_name: userProfile?.last_name || '',
          email: authUser ? authUser.email : 'Inconnu'
        };
      });

      setStatistics(enrichedStats);
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques:", err);
      setError(err.message || "Impossible de charger les statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAdmin,
    isLoading,
    statistics,
    error,
    refreshStatistics: fetchStatistics
  };
};

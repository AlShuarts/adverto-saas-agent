
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

// Define a type for the profile data
type ProfileData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
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

      // Récupérer les statistiques d'utilisation via la fonction admin-get-users
      const { data: authUsers, error: authError } = await supabase.functions.invoke('admin-get-users');
      
      if (authError) throw authError;
      
      // Récupérer les informations des utilisateurs pour les lier aux statistiques
      const { data: usersProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      
      if (profilesError) throw profilesError;

      // Note: Suppression de l'appel RPC à 'admin_get_users' qui n'existe pas
      // Utilisation directe des données de la fonction Supabase

      // Enrichir les données des statistiques avec les informations des utilisateurs
      const enrichedStats: UsageStatistic[] = (authUsers || []).map((stat: any) => {
        // Recherche du profil utilisateur correspondant, avec valeurs par défaut si non trouvé
        const userProfile = (usersProfiles?.find(u => u.id === stat.user_id) || {}) as ProfileData;
        
        return {
          ...stat,
          // TypeScript safe access avec valeurs par défaut
          first_name: userProfile.first_name || 'Inconnu',
          last_name: userProfile.last_name || '',
          email: stat.email || 'Inconnu'
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

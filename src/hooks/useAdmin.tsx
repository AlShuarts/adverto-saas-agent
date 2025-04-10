
import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

export type UsageStatistic = {
  id: string;
  user_id: string;
  description_generations: number;
  slideshow_generations: number;
  facebook_generations: number;
  instagram_generations: number;
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
        console.log("Vérification du statut d'admin pour l'utilisateur:", profile.id);
        
        // Vérifier si l'utilisateur est admin
        if (profile.role === 'admin') {
          console.log("L'utilisateur est admin, récupération des statistiques");
          setIsAdmin(true);
          // Si admin, charger les statistiques
          await fetchStatistics();
        } else {
          console.log("L'utilisateur n'est pas admin");
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
      console.log("Récupération des statistiques d'utilisation");

      // Récupérer les statistiques d'utilisation directement de la table
      const { data: usageStats, error: statsError } = await supabase
        .from('usage_statistics')
        .select('*');
      
      if (statsError) {
        console.error("Erreur lors de la récupération des statistiques:", statsError);
        throw statsError;
      }
      
      console.log("Statistiques récupérées:", usageStats);

      // Récupérer les informations des utilisateurs pour les lier aux statistiques
      const { data: usersProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      
      if (profilesError) {
        console.error("Erreur lors de la récupération des profils:", profilesError);
        throw profilesError;
      }

      // Récupérer les emails des utilisateurs via la fonction admin-get-users
      const { data: authUsers, error: authError } = await supabase.functions.invoke('admin-get-users');
      
      if (authError) {
        console.error("Erreur lors de la récupération des emails:", authError);
        throw authError;
      }

      // Enrichir les données des statistiques avec les informations des utilisateurs
      const enrichedStats: UsageStatistic[] = (usageStats || []).map((stat: any) => {
        // Recherche du profil utilisateur correspondant
        const userProfile = (usersProfiles?.find(u => u.id === stat.user_id) || {}) as ProfileData;
        // Recherche de l'email correspondant
        const authUser = authUsers?.find((u: any) => u.id === stat.user_id);
        
        return {
          ...stat,
          // TypeScript safe access avec valeurs par défaut
          first_name: userProfile.first_name || 'Inconnu',
          last_name: userProfile.last_name || '',
          email: authUser?.email || 'Inconnu',
          facebook_generations: stat.facebook_generations || 0,
          instagram_generations: stat.instagram_generations || 0
        };
      });

      console.log("Statistiques enrichies:", enrichedStats);
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


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
  banner_generations: number;
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
        console.log("Vérification du statut d'admin pour l'utilisateur:", profile.id);
        
        // Tenter de charger les statistiques via la fonction Edge (qui vérifie l'admin côté serveur)
        try {
          const { data, error } = await supabase.functions.invoke('admin-get-users');
          if (error) {
            console.log("L'utilisateur n'est pas admin ou erreur d'accès", error);
            setIsAdmin(false);
          } else if (Array.isArray(data)) {
            console.log("L'utilisateur est admin, statistiques chargées");
            setIsAdmin(true);
            setStatistics(data);
          }
        } catch (e) {
          console.log("Accès refusé aux statistiques", e);
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

      // Récupérer les statistiques enrichies via la fonction Edge
      const { data, error } = await supabase.functions.invoke('admin-get-users');
      
      if (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        throw error;
      }
      
      console.log("Statistiques récupérées:", data);
      
      if (Array.isArray(data)) {
        setStatistics(data);
      } else {
        console.error("Format de données inattendu:", data);
        throw new Error("Format de données inattendu");
      }
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

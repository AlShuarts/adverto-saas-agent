import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useFacebookTokenChecker = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("facebook_access_token, facebook_page_id")
          .eq("id", user.id)
          .single();

        if (!profile?.facebook_access_token || !profile?.facebook_page_id) {
          return;
        }

        const response = await fetch(
          `https://graph.facebook.com/v23.0/${profile.facebook_page_id}?access_token=${encodeURIComponent(profile.facebook_access_token.trim())}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          
          if (errorData.error?.code === 190) {
            toast({
              title: "Connexion Facebook expirée",
              description: "Vous allez être redirigé vers votre profil pour reconnecter Facebook.",
              variant: "destructive",
              duration: 5000,
            });
            
            setTimeout(() => {
              navigate("/profile");
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
      }
    };

    checkToken();
  }, [toast, navigate]);
};

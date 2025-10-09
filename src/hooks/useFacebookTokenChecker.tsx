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

        // Use SECURITY DEFINER function to get credentials securely
        const { data: fbCreds, error: fbError } = await supabase
          .rpc('get_facebook_credentials', { _user_id: user.id });

        if (fbError || !fbCreds || fbCreds.length === 0) {
          return;
        }

        const { page_id, access_token } = fbCreds[0];
        
        if (!access_token || !page_id) {
          return;
        }

        const response = await fetch(
          `https://graph.facebook.com/v23.0/${page_id}?access_token=${encodeURIComponent(access_token.trim())}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          
          if (errorData.error?.code === 190) {
            toast({
              title: "Connexion Facebook expirée",
              description: "Vous allez être redirigé vers la page d'accueil pour reconnecter Facebook.",
              variant: "destructive",
              duration: 5000,
            });
            
            setTimeout(() => {
              navigate("/");
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

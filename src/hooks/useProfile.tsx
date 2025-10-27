import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { type FacebookPage } from "./useFacebookPageDiagnostics";

export const useProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        getProfile();
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (window.location.pathname !== '/auth') {
          navigate("/auth");
        }
        setLoading(false);
        setInitialized(true);
        return;
      }
      await getProfile();
    } catch (error) {
      console.error("Error checking session:", error);
      if (window.location.pathname !== '/auth') {
        navigate("/auth");
      }
      setLoading(false);
      setInitialized(true);
    }
  };

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (window.location.pathname !== '/auth') {
          navigate("/auth");
        }
        setLoading(false);
        setInitialized(true);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
        setLoading(false);
        setInitialized(true);
        return;
      }

      setProfile(data);
      setLoading(false);
      setInitialized(true);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      setLoading(false);
      setInitialized(true);
    }
  };

  const handleFacebookLoginResponse = async (response: any) => {
    console.log("📥 Réponse Facebook Login Button:", response);
    
    if (response.status !== 'connected') {
      console.log("❌ Utilisateur non connecté");
      return;
    }
    
    setLoading(true);
    
    try {
      const authResponse = response.authResponse;
      
      // Le config_id retourne directement le Page Access Token et Page ID
      const pageAccessToken = authResponse.pageAccessToken;
      const pageId = authResponse.pageID;
      
      if (!pageAccessToken || !pageId) {
        throw new Error("Page Access Token ou Page ID manquant dans la réponse. Assurez-vous d'avoir coché une page dans le popup.");
      }
      
      console.log("✅ Page ID:", pageId);
      console.log("✅ Page Access Token reçu");
      
      // Échanger contre un token longue durée
      const { data: exchangeData, error: exchangeError } = await supabase.functions.invoke(
        'exchange-facebook-token',
        { body: { shortLivedToken: pageAccessToken } }
      );
      
      if (exchangeError) {
        throw new Error(exchangeError.message);
      }
      
      const longLivedToken = exchangeData.access_token;
      
      // Sauvegarder dans la base de données
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: pageId,
          facebook_access_token: longLivedToken,
        })
        .eq('id', profile.id);
      
      if (updateError) {
        throw updateError;
      }
      
      console.log("✅ Page Facebook connectée avec succès");
      
      toast({
        title: "Connexion réussie",
        description: "Votre page Facebook a été connectée avec succès",
      });
      
      await getProfile();
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Impossible de connecter votre page Facebook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Exposer la fonction globalement pour le Login Button
  useEffect(() => {
    if (typeof window !== 'undefined' && window.FB) {
      (window as any).checkFacebookLoginState = () => {
        (window.FB as any).getLoginStatus((response: any) => {
          handleFacebookLoginResponse(response);
        });
      };
    }
  }, [profile]);



  const connectInstagram = async () => {
    console.log("🔄 Début de la connexion Instagram...");
    
    if (!profile?.facebook_page_id) {
      console.error("❌ Prérequis manquants pour Instagram");
      toast({
        title: "Erreur",
        description: "Vous devez d'abord connecter votre page Facebook",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté");
      }

      // Get Facebook credentials securely server-side
      const { data: fbCreds, error: fbError } = await supabase
        .rpc('get_facebook_credentials', { _user_id: user.id });

      if (fbError || !fbCreds || fbCreds.length === 0) {
        toast({
          title: "Erreur",
          description: "Vous devez d'abord connecter votre page Facebook",
          variant: "destructive",
        });
        return;
      }

      const { page_id, access_token } = fbCreds[0];

      // Verify Facebook token is still valid
      console.log("Vérification du token Facebook avant connexion Instagram...");
      const tokenCheckResponse = await fetch(
        `https://graph.facebook.com/v23.0/${page_id}?fields=id,name&access_token=${encodeURIComponent(access_token)}`
      );

      if (!tokenCheckResponse.ok) {
        const errorData = await tokenCheckResponse.json();
        console.error("Token Facebook invalide pour Instagram:", errorData);
        toast({
          title: "Token Facebook expiré",
          description: "Votre token Facebook a expiré. Veuillez d'abord reconnecter votre page Facebook.",
          variant: "destructive",
        });
        return;
      }

      console.log("Recherche du compte Instagram professionnel...");
      const response = await fetch(
        `https://graph.facebook.com/v23.0/${page_id}?fields=instagram_business_account&access_token=${encodeURIComponent(access_token)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur lors de la récupération du compte Instagram:", errorData);
        throw new Error(errorData.error?.message || "Erreur lors de la connexion Instagram");
      }

      const data = await response.json();
      console.log("Réponse Instagram:", data);
      
      if (!data.instagram_business_account?.id) {
        toast({
          title: "Aucun compte Instagram trouvé",
          description: "Aucun compte Instagram professionnel n'est associé à votre page Facebook. Veuillez d'abord connecter un compte Instagram professionnel à votre page Facebook.",
          variant: "destructive",
        });
        return;
      }

      // Verify Instagram account is accessible
      console.log("Validation du compte Instagram...");
      const instagramValidationResponse = await fetch(
        `https://graph.facebook.com/v23.0/${data.instagram_business_account.id}?fields=id,username&access_token=${encodeURIComponent(access_token)}`
      );

      if (!instagramValidationResponse.ok) {
        const errorData = await instagramValidationResponse.json();
        console.error("Impossible d'accéder au compte Instagram:", errorData);
        toast({
          title: "Erreur d'accès Instagram",
          description: "Impossible d'accéder à votre compte Instagram. Vérifiez que le compte est bien configuré comme compte professionnel et lié à votre page Facebook.",
          variant: "destructive",
        });
        return;
      }

      const instagramData = await instagramValidationResponse.json();
      console.log("Compte Instagram validé:", instagramData);

      // Save connection (trigger will migrate token to social_tokens table)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          instagram_user_id: data.instagram_business_account.id,
          instagram_access_token: access_token
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: `Votre compte Instagram (@${instagramData.username}) a été connecté avec succès`,
      });

      getProfile();
    } catch (error) {
      console.error('Erreur de connexion Instagram:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de connecter votre compte Instagram",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { 
    profile, 
    loading, 
    initialized, 
    getProfile, 
    handleFacebookLoginResponse,
    connectInstagram 
  };
};

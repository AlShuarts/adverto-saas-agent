import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { type FacebookPage } from "./useFacebookPageDiagnostics";
import { reportErrorDirect } from "./useErrorReport";

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
    console.log("📥 Réponse Facebook Login Button:", JSON.stringify(response, null, 2));
    
    if (response.status !== 'connected') {
      console.log("❌ Utilisateur non connecté");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté");
      }
      
      const authResponse = response.authResponse;
      
      // === DIAGNOSTIC: Log détaillé de authResponse ===
      console.log("🔍 AuthResponse complète:", JSON.stringify(authResponse, null, 2));
      console.log("📄 pageAccessToken présent:", !!authResponse.pageAccessToken);
      console.log("📄 pageID présent:", !!authResponse.pageID);
      console.log("📄 accessToken présent:", !!authResponse.accessToken);
      console.log("📄 userID présent:", !!authResponse.userID);
      
      let pageAccessToken = authResponse.pageAccessToken;
      let pageId = authResponse.pageID;
      
      // Repli: si le config_id ne retourne pas directement le pageAccessToken/pageID
      if (!pageAccessToken || !pageId) {
        console.log("⚠️ Page Access Token ou Page ID manquant, récupération via /me/accounts...");
        
        // D'abord vérifier les permissions accordées
        await new Promise<void>((resolve) => {
          (window as any).FB.api('/me/permissions', (permRes: any) => {
            console.log("📋 Permissions brutes:", JSON.stringify(permRes, null, 2));
            
            if (permRes?.data) {
              const granted = permRes.data.filter((p: any) => p.status === 'granted').map((p: any) => p.permission);
              const declined = permRes.data.filter((p: any) => p.status === 'declined').map((p: any) => p.permission);
              
              console.log("✅ Permissions accordées:", granted);
              console.log("❌ Permissions refusées:", declined);
              
              const criticalPerms = ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'];
              const missingCritical = criticalPerms.filter(p => !granted.includes(p));
              
              if (missingCritical.length > 0) {
                console.warn("⚠️ Permissions critiques manquantes:", missingCritical);
              }
            }
            resolve();
          });
        });
        
        await new Promise<void>((resolve, reject) => {
          (window as any).FB.api('/me/accounts?fields=id,name,access_token,category,tasks', (res: any) => {
            console.log("📄 /me/accounts brut:", JSON.stringify(res, null, 2));
            
            if (res?.error) {
              console.error("❌ Erreur API /me/accounts:", res.error);
              reject(new Error(`Erreur Facebook: ${res.error.message}`));
              return;
            }
            
            console.log("📊 Nombre de pages retournées:", res?.data?.length || 0);
            
            if (!res.data || res.data.length === 0) {
              console.warn("⚠️ /me/accounts vide - tentative via Business Manager...");
              
              // Fallback: Essayer via Business Manager
              (window as any).FB.api('/me/businesses?fields=id,name', (bizRes: any) => {
                console.log("🏢 Businesses:", JSON.stringify(bizRes, null, 2));
                
                if (bizRes?.data && bizRes.data.length > 0) {
                  const businessId = bizRes.data[0].id;
                  console.log("🔄 Récupération des pages du Business Manager:", businessId);
                  
                  (window as any).FB.api(
                    `/${businessId}/owned_pages?fields=id,name,access_token`,
                    (pagesRes: any) => {
                      console.log("📄 Pages Business Manager:", JSON.stringify(pagesRes, null, 2));
                      
                      if (pagesRes?.data && pagesRes.data.length > 0) {
                        pageId = pagesRes.data[0].id;
                        pageAccessToken = pagesRes.data[0].access_token;
                        (window as any).__fbPageName = pagesRes.data[0].name;
                        console.log("✅ Page trouvée via Business Manager:", pagesRes.data[0].name);
                        resolve();
                      } else {
                        reject(new Error(
                          "Aucune page accessible.\n\n" +
                          "📋 Consultez la console (F12) pour les détails.\n\n" +
                          "Causes possibles:\n" +
                          "• Permission 'pages_show_list' non accordée\n" +
                          "• La page n'est pas accessible à cette app\n" +
                          "• Rôle insuffisant sur la page"
                        ));
                      }
                    }
                  );
                } else {
                  reject(new Error(
                    "Aucune page Facebook accessible.\n\n" +
                    "📋 Consultez la console (F12) pour les détails.\n\n" +
                    "💡 Solutions:\n" +
                    "1. Vérifiez les permissions dans le popup Facebook\n" +
                    "2. Assurez-vous d'être Admin de la page\n" +
                    "3. Reconnectez en cochant toutes les pages"
                  ));
                }
              });
              return;
            }
            
            let pageName = '';
            
            // Si une seule page, la prendre directement
            if (res.data.length === 1) {
              pageId = res.data[0].id;
              pageAccessToken = res.data[0].access_token;
              pageName = res.data[0].name;
              console.log("✅ Page unique trouvée:", pageName);
            } else {
              // Si plusieurs pages, prendre celle déjà connectée dans le profil si possible
              const existingPage = res.data.find((p: FacebookPage) => p.id === profile?.facebook_page_id);
              if (existingPage) {
                pageId = existingPage.id;
                pageAccessToken = existingPage.access_token;
                pageName = existingPage.name;
                console.log("✅ Page existante reconnectée:", pageName);
              } else {
                // Sinon prendre la première
                pageId = res.data[0].id;
                pageAccessToken = res.data[0].access_token;
                pageName = res.data[0].name;
                console.log("✅ Première page sélectionnée:", pageName);
              }
            }
            
            // Stocker le nom de la page pour la mise à jour
            (window as any).__fbPageName = pageName;
            resolve();
          });
        });
      }
      
      if (!pageAccessToken || !pageId) {
        throw new Error("Page Access Token ou Page ID manquant. Assurez-vous d'avoir coché une page dans le popup et d'avoir accordé les permissions nécessaires.");
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
      const pageName = (window as any).__fbPageName || '';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: pageId,
          facebook_access_token: longLivedToken,
          facebook_page_name: pageName,
        } as any)
        .eq('id', user.id);
      
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
      console.error("❌ Erreur complète:", error);
      
      // Envoyer le rapport d'erreur aux admins
      reportErrorDirect(error instanceof Error ? error : new Error(String(error)), {
        errorType: 'facebook_connection',
        actionContext: 'connecting_facebook_page',
        facebookResponse: (window as any).__lastFacebookResponse,
        additionalData: {
          pageId: (window as any).__fbPageId,
          pageName: (window as any).__fbPageName,
        },
      });
      
      toast({
        title: "Erreur de connexion Facebook",
        description: (error instanceof Error ? error.message : "Impossible de connecter votre page Facebook") + 
          "\n\n📋 Ouvrez la console (F12) pour plus de détails.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Exposer la fonction globalement pour le Login Button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    (window as any).checkFacebookLoginState = () => {
      console.log("✅ onlogin callback déclenché");
      
      const attempt = () => {
        if ((window as any).FB) {
          console.log("✅ Facebook SDK prêt, récupération du statut...");
          (window as any).FB.getLoginStatus((response: any) => {
            handleFacebookLoginResponse(response);
          });
        } else {
          console.log("⏳ Facebook SDK pas encore prêt, nouvelle tentative...");
          setTimeout(attempt, 300);
        }
      };
      
      attempt();
    };
  }, [handleFacebookLoginResponse]);



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
          instagram_access_token: access_token,
          instagram_username: instagramData.username,
        } as any)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: `Votre compte Instagram (@${instagramData.username}) a été connecté avec succès`,
      });

      getProfile();
    } catch (error) {
      console.error('Erreur de connexion Instagram:', error);
      
      // Envoyer le rapport d'erreur aux admins
      reportErrorDirect(error instanceof Error ? error : new Error(String(error)), {
        errorType: 'instagram_connection',
        actionContext: 'connecting_instagram_account',
        additionalData: {
          facebookPageId: profile?.facebook_page_id,
        },
      });
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de connecter votre compte Instagram",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectFacebook = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté");

      // Réinitialiser les données Facebook et Instagram (Instagram dépend de FB)
      const { error } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: null,
          facebook_access_token: null,
          facebook_page_name: null,
          instagram_user_id: null,
          instagram_access_token: null,
          instagram_username: null,
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      // Déconnecter du SDK Facebook
      if ((window as any).FB) {
        (window as any).FB.logout(() => {
          console.log("✅ Déconnecté du SDK Facebook");
        });
      }

      toast({
        title: "Déconnexion réussie",
        description: "Votre compte Facebook a été déconnecté",
      });

      await getProfile();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de déconnecter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectInstagram = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté");

      // Réinitialiser uniquement les données Instagram
      const { error } = await supabase
        .from('profiles')
        .update({
          instagram_user_id: null,
          instagram_access_token: null,
          instagram_username: null,
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Déconnexion réussie",
        description: "Votre compte Instagram a été déconnecté",
      });

      await getProfile();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de déconnecter",
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
    connectInstagram,
    disconnectFacebook,
    disconnectInstagram
  };
};

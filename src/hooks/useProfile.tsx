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

  const connectFacebook = async () => {
    if (!window.FB) {
      toast({
        title: "Erreur",
        description: "Le SDK Facebook n'est pas disponible. Veuillez désactiver votre bloqueur de publicités et rafraîchir la page.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Clear old connection status
      console.log("Nettoyage des anciennes connexions...");
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: null,
          instagram_user_id: null
        })
        .eq('id', profile.id);

      if (resetError) {
        console.error("Erreur lors du nettoyage:", resetError);
        throw resetError;
      }

      // Étape 1: Connexion utilisateur Facebook avec permissions étendues
      console.log("Connexion à Facebook avec permissions étendues...");
      console.log("SDK Facebook disponible:", !!window.FB);
      
      const authResponse = await new Promise<fb.AuthResponse>((resolve, reject) => {
        window.FB.login((response) => {
          console.log("Réponse complète de connexion Facebook:", JSON.stringify(response, null, 2));
          console.log("Status:", response.status);
          console.log("AuthResponse:", response.authResponse);
          console.log("Granted Scopes:", (response as any)?.grantedScopes);
          
          if (response.status === 'connected') {
            console.log("✅ Connexion Facebook réussie");
          } else {
            console.error("❌ Échec de la connexion Facebook:", response.status);
          }
          
          resolve(response);
        }, {
          scope: 'pages_manage_posts,pages_show_list,pages_manage_metadata,pages_read_engagement,instagram_basic,instagram_content_publish,business_management',
          auth_type: 'rerequest',
          return_scopes: true
        } as any);
      });

      if (authResponse.status !== 'connected') {
        throw new Error("Connexion Facebook échouée ou annulée");
      }

      // Vérifier si l'utilisateur a accordé l'accès aux pages
      const grantedScopes = (authResponse.authResponse as any)?.grantedScopes || '';
      console.log("🔐 Scopes accordés lors du login:", grantedScopes);

      if (!grantedScopes.includes('pages_show_list')) {
        console.error("❌ L'utilisateur n'a pas accordé l'accès à ses pages");
        throw new Error("Vous devez autoriser l'accès à vos pages Facebook pour continuer");
      }

      const userAccessToken = authResponse.authResponse?.accessToken;
      if (!userAccessToken) {
        throw new Error("Token utilisateur Facebook non trouvé");
      }

      // Étape 2: Vérifier les permissions accordées
      console.log("Vérification des permissions accordées...");
      const permissionsResponse = await new Promise<any>((resolve, reject) => {
        window.FB.api('/me/permissions', (response) => {
          console.log("📋 Permissions:", JSON.stringify(response, null, 2));
          if (response.error) {
            reject(new Error(`Erreur permissions: ${response.error.message}`));
          } else {
            resolve(response);
          }
        });
      });

      const grantedPermissions = permissionsResponse.data
        ?.filter((p: any) => p.status === 'granted')
        ?.map((p: any) => p.permission) || [];
      
      const declinedPermissions = permissionsResponse.data
        ?.filter((p: any) => p.status === 'declined')
        ?.map((p: any) => p.permission) || [];

      console.log("✅ Permissions accordées:", grantedPermissions);
      console.log("❌ Permissions refusées:", declinedPermissions);

      // Afficher les détails complets si des permissions sont refusées
      if (declinedPermissions.length > 0) {
        console.warn("⚠️ ATTENTION: L'utilisateur a refusé ces permissions:", declinedPermissions);
      }

      // Vérifier les permissions critiques
      const requiredPermissions = ['pages_show_list', 'pages_manage_posts'];
      const missingPermissions = requiredPermissions.filter(
        perm => !grantedPermissions.includes(perm)
      );

      if (missingPermissions.length > 0) {
        console.error("❌ Permissions manquantes:", missingPermissions);
        console.error("💡 L'utilisateur doit réautoriser et cocher TOUTES les permissions");
        throw new Error(
          `Permissions manquantes: ${missingPermissions.join(', ')}. ` +
          `Veuillez réessayer et autoriser toutes les permissions demandées.`
        );
      }

      // Étape 3: Obtenir les pages avec le token utilisateur
      console.log("🔄 Début de la récupération des pages Facebook...");
      console.log("Token utilisateur utilisé:", userAccessToken?.substring(0, 20) + "...");
      
      // Fonction utilitaire pour récupérer toutes les pages avec pagination (via cursors)
      const fetchAllPages = async (endpoint: string, userToken: string): Promise<any[]> => {
        let allData: any[] = [];
        const [basePath, initialQuery = ""] = endpoint.split("?");
        const base = basePath.startsWith("/") ? basePath : `/${basePath}`;
        const hasTokenParam = initialQuery.includes("access_token=");
        const baseQuery = hasTokenParam ? initialQuery : `${initialQuery}${initialQuery ? "&" : ""}access_token=${userToken}`;
        
        let after: string | null = null;
        let pageCount = 0;
        
        while (true) {
          const path = `${base}?${baseQuery}${after ? `&after=${after}` : ""}`;
          pageCount++;
          console.log(`   Appel ${pageCount}: ${path.substring(0, 120)}...`);
          
          const response: any = await new Promise((resolve, reject) => {
            window.FB.api(path, (res: any) => {
              if (res && res.error) {
                console.error(`   Erreur API: ${res.error.message}`);
                reject(res.error);
              } else {
                resolve(res);
              }
            });
          });
          
          if (response && Array.isArray(response.data) && response.data.length > 0) {
            console.log(`   ✓ ${response.data.length} résultat(s)`);
            allData = allData.concat(response.data);
          }
          
          const nextAfter = response?.paging?.cursors?.after;
          if (nextAfter && nextAfter !== after) {
            after = nextAfter;
          } else {
            break;
          }
        }
        
        return allData;
      };

      // Récupérer les pages cochées dans le popup OAuth
      console.log("📥 Récupération des pages cochées...");
      console.log("🔑 Token utilisé:", userAccessToken.substring(0, 20) + "...");
      console.log("🎯 Endpoint appelé: /me/accounts?fields=id,name,access_token");
      
      const accountsPages: any[] = await new Promise((resolve, reject) => {
        window.FB.api(
          '/me/accounts?fields=id,name,access_token',
          (res: any) => {
            if (res && res.error) {
              console.error("❌ Erreur:", res.error);
              reject(res.error);
            } else {
              resolve(res.data || []);
            }
          }
        );
      });

      console.log("📦 Réponse complète de /me/accounts:", JSON.stringify(accountsPages, null, 2));
      console.log(`✅ ${accountsPages.length} page(s) retournée(s) par l'API`);

      if (accountsPages.length === 0) {
        console.error("❌ PROBLÈME: L'API /me/accounts n'a retourné aucune page");
        console.error("💡 Raisons possibles:");
        console.error("   1. L'utilisateur n'est pas Admin/Éditeur/Modérateur de la page cochée");
        console.error("   2. La page est gérée par un Business Manager");
        console.error("   3. La permission pages_show_list a été refusée");
        console.error("   4. Le token utilisateur est invalide");
      }

      const pages = {
        data: accountsPages
      };

      if (pages.data.length === 0) {
        console.error("❌ Aucune page trouvée");
        toast({
          title: "Aucune page trouvée",
          description: "Vous devez être Admin, Éditeur ou Modérateur de la page que vous souhaitez connecter. Si vous avez coché une page dans le popup mais qu'elle n'apparaît pas ici, vérifiez vos rôles sur cette page dans Facebook Business Suite.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }


      // Connecter automatiquement la première page cochée
      console.log(`🔄 Connexion de ${pages.data[0].name}...`);
      await connectSinglePage(pages.data[0], userAccessToken);
    } catch (error) {
      console.error('❌ Erreur de connexion Facebook:', error);
      toast({
        title: "Erreur de connexion Facebook",
        description: error instanceof Error ? error.message : "Impossible de connecter votre page Facebook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectSinglePage = async (page: FacebookPage, userAccessToken: string) => {
    try {
      console.log("📌 Connexion de la page:", page.name);

      // Obtenir le token de page
      const longLivedPageTokenResponse = await fetch(
        `https://graph.facebook.com/v23.0/${page.id}?fields=access_token&access_token=${userAccessToken}`
      );

      const pageTokenData = await longLivedPageTokenResponse.json();
      let pageToken = pageTokenData.access_token;

      if (!pageToken) {
        throw new Error("Token de page non trouvé");
      }

      // Échanger contre un token longue durée (60 jours)
      console.log("🔄 Échange du token pour un token longue durée...");
      try {
        const { data: exchangeData, error: exchangeError } = await supabase.functions.invoke(
          'exchange-facebook-token',
          { body: { shortLivedToken: pageToken } }
        );

        if (exchangeError) {
          console.error("Erreur lors de l'échange du token:", exchangeError);
          console.log("⚠️ Utilisation du token court (non recommandé)");
        } else if (exchangeData?.access_token) {
          pageToken = exchangeData.access_token;
          console.log("✅ Token longue durée obtenu");
        }
      } catch (error) {
        console.error("Erreur d'échange de token:", error);
        console.log("⚠️ Utilisation du token court (non recommandé)");
      }

      // Save connection to secure social_tokens table via migration trigger
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: page.id,
          facebook_access_token: pageToken
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: `Page "${page.name}" connectée avec succès`,
      });

      await getProfile();
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de connecter cette page",
        variant: "destructive",
      });
    }
  };


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
    connectFacebook,
    connectInstagram
  };
};

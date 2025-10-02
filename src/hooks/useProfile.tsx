import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useFacebookPageDiagnostics, type FacebookPage } from "./useFacebookPageDiagnostics";
import { FacebookPageSelector } from "@/components/FacebookPageSelector";

export const useProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [availablePages, setAvailablePages] = useState<FacebookPage[]>([]);
  const { diagnosePages, showDetailedDiagnostic, getErrorMessageForPage } = useFacebookPageDiagnostics();

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
      // Nettoyer les anciens tokens
      console.log("Nettoyage des anciens tokens Facebook...");
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: null,
          facebook_access_token: null,
          instagram_user_id: null,
          instagram_access_token: null
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
          
          if (response.status === 'connected') {
            console.log("✅ Connexion Facebook réussie");
          } else {
            console.error("❌ Échec de la connexion Facebook:", response.status);
          }
          
          resolve(response);
        }, {
          scope: 'pages_manage_posts,pages_show_list,pages_manage_metadata,pages_read_engagement,instagram_basic,instagram_content_publish',
          auth_type: 'rerequest'
        } as any);
      });

      if (authResponse.status !== 'connected') {
        throw new Error("Connexion Facebook échouée ou annulée");
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

      // Vérifier les permissions critiques
      const requiredPermissions = ['pages_show_list', 'pages_manage_posts'];
      const missingPermissions = requiredPermissions.filter(
        perm => !grantedPermissions.includes(perm)
      );

      if (missingPermissions.length > 0) {
        console.error("❌ Permissions manquantes:", missingPermissions);
        throw new Error(
          `Permissions manquantes: ${missingPermissions.join(', ')}. ` +
          `Veuillez réessayer et autoriser toutes les permissions demandées.`
        );
      }

      // Étape 3: Obtenir les pages avec le token utilisateur
      console.log("Récupération des pages Facebook...");
      console.log("Token utilisateur utilisé:", userAccessToken?.substring(0, 20) + "...");
      
      const pages = await new Promise<any>((resolve, reject) => {
        window.FB.api(`/me/accounts?fields=id,name,category,tasks,access_token&access_token=${userAccessToken}`, (response) => {
          console.log("🔍 Réponse complète de l'API Facebook pour les pages:", JSON.stringify(response, null, 2));
          
          if (response.error) {
            console.error("❌ Erreur API Facebook:", response.error);
            reject(new Error(`Erreur Facebook: ${response.error.message} (Code: ${response.error.code})`));
          } else {
            console.log("✅ Pages récupérées avec succès");
            console.log("📊 Nombre de pages trouvées:", response.data?.length || 0);
            if (response.data && response.data.length > 0) {
              response.data.forEach((page: any, index: number) => {
                console.log(`📄 Page ${index + 1}:`, {
                  id: page.id,
                  name: page.name,
                  category: page.category,
                  tasks: page.tasks,
                  has_token: !!page.access_token
                });
              });
            }
            resolve(response);
          }
        });
      });

      if (!pages.data || pages.data.length === 0) {
        console.error("❌ Aucune page Facebook trouvée pour ce compte");
        console.log("💡 Causes possibles:");
        console.log("1. L'application est en mode Développement et vous n'êtes pas Testeur/Développeur");
        console.log("2. Vous n'avez pas coché vos pages lors de l'autorisation");
        console.log("3. Vous n'avez pas 'Facebook access – Full control' sur vos pages");
        console.log("4. Les permissions de l'app ne sont pas approuvées en production");
        console.log("5. Votre compte nécessite l'authentification à deux facteurs (2FA)");
        
        toast({
          title: "Aucune page trouvée",
          description: "Nous n'avons pas pu accéder à vos pages Facebook. Assurez-vous de bien cocher toutes les pages lors de l'autorisation.",
          variant: "destructive",
        });
        
        setLoading(false);
        return;
      }

      // Diagnostic des pages
      const diagnostics = diagnosePages(pages.data);
      showDetailedDiagnostic(diagnostics);

      // Si plusieurs pages, afficher le sélecteur
      if (pages.data.length > 1) {
        console.log("📋 Plusieurs pages disponibles, affichage du sélecteur...");
        setAvailablePages(pages.data);
        setShowPageSelector(true);
        setLoading(false);
        return;
      }

      // Une seule page, la connecter directement
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
      console.log("📌 Connexion de la page:", {
        id: page.id,
        name: page.name,
        category: page.category,
        tasks: page.tasks
      });

      // Vérifier les permissions
      const diagnostic = diagnosePages([page])[0];
      
      if (diagnostic.status === 'incompatible') {
        const errorMessage = getErrorMessageForPage(page);
        toast({
          title: "⚠️ Permissions insuffisantes - Test activé",
          description: errorMessage + " La connexion est autorisée pour test. La publication pourrait échouer.",
          variant: "destructive",
        });
        // return; // Temporairement désactivé pour tester la publication avec permissions limitées
      }

      if (diagnostic.status === 'limited') {
        toast({
          title: "Permissions limitées",
          description: "Cette page a des permissions limitées. Certaines fonctionnalités pourraient ne pas fonctionner correctement.",
        });
      }

      // Étape 4: Obtenir un token de page longue durée
      console.log("Obtention du token de page longue durée...");
      const longLivedPageTokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?` +
        `fields=access_token&` +
        `access_token=${userAccessToken}`
      );

      if (!longLivedPageTokenResponse.ok) {
        const errorData = await longLivedPageTokenResponse.json();
        console.error("❌ Erreur obtention token de page:", errorData);
        throw new Error("Impossible d'obtenir le token de page");
      }

      const pageTokenData = await longLivedPageTokenResponse.json();
      const pageToken = pageTokenData.access_token;

      if (!pageToken) {
        throw new Error("Token de page non trouvé dans la réponse");
      }

      // Étape 5: Valider le token de page
      console.log("Validation du token de page...");
      const tokenValidationResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${pageToken}`
      );

      if (!tokenValidationResponse.ok) {
        const errorData = await tokenValidationResponse.json();
        console.error("❌ Token de page invalide:", errorData);
        throw new Error("Le token de page n'est pas valide");
      }

      const tokenInfo = await tokenValidationResponse.json();
      console.log("✅ Token validé pour:", tokenInfo);

      // Étape 6: Sauvegarder le token
      console.log("Sauvegarde du token de page...");
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: page.id,
          facebook_access_token: pageToken
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error("❌ Erreur sauvegarde:", updateError);
        throw updateError;
      }

      toast({
        title: "Succès",
        description: `Page "${page.name}" connectée avec succès`,
      });

      await getProfile();
    } catch (error) {
      console.error('❌ Erreur lors de la connexion de la page:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de connecter cette page",
        variant: "destructive",
      });
    }
  };

  const handlePageSelection = async (page: FacebookPage) => {
    setShowPageSelector(false);
    setLoading(true);
    
    try {
      // Récupérer à nouveau le token utilisateur
      const authResponse = await new Promise<fb.AuthResponse>((resolve) => {
        window.FB.login(resolve, {
          scope: 'pages_manage_posts,pages_show_list,pages_manage_metadata,pages_read_engagement,instagram_basic,instagram_content_publish',
          auth_type: 'rerequest'
        } as any);
      });

      if (authResponse.status !== 'connected' || !authResponse.authResponse?.accessToken) {
        throw new Error("Impossible d'obtenir le token utilisateur");
      }

      await connectSinglePage(page, authResponse.authResponse.accessToken);
    } catch (error) {
      console.error('Erreur lors de la sélection de la page:', error);
      toast({
        title: "Erreur",
        description: "Impossible de connecter la page sélectionnée",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectInstagram = async () => {
    console.log("🔄 Début de la connexion Instagram...");
    console.log("📋 Profile actuel:", { 
      facebook_page_id: profile?.facebook_page_id, 
      has_facebook_token: !!profile?.facebook_access_token,
      instagram_user_id: profile?.instagram_user_id 
    });
    
    if (!profile?.facebook_page_id || !profile?.facebook_access_token) {
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
      // Vérifier d'abord que le token Facebook est toujours valide
      console.log("Vérification du token Facebook avant connexion Instagram...");
      const tokenCheckResponse = await fetch(
        `https://graph.facebook.com/v18.0/${profile.facebook_page_id}?fields=id,name&access_token=${profile.facebook_access_token}`
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
        `https://graph.facebook.com/v18.0/${profile.facebook_page_id}?fields=instagram_business_account&access_token=${profile.facebook_access_token}`
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

      // Vérifier que le compte Instagram est accessible avec ce token
      console.log("Validation du compte Instagram...");
      const instagramValidationResponse = await fetch(
        `https://graph.facebook.com/v18.0/${data.instagram_business_account.id}?fields=id,username&access_token=${profile.facebook_access_token}`
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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          instagram_user_id: data.instagram_business_account.id,
          instagram_access_token: profile.facebook_access_token
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
    connectInstagram,
    PageSelector: () => (
      <FacebookPageSelector
        open={showPageSelector}
        pages={availablePages}
        onSelect={handlePageSelection}
        onCancel={() => {
          setShowPageSelector(false);
          setLoading(false);
        }}
      />
    )
  };
};

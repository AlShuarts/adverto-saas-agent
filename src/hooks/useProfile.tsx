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

      // Récupérer les pages depuis /me/accounts
      console.log("📥 Récupération depuis /me/accounts...");
      let accountsPages: any[] = [];
      try {
        accountsPages = await fetchAllPages(
          `/me/accounts?fields=id,name,category,tasks,access_token,perms,role&limit=100`,
          userAccessToken
        );
        console.log(`✅ ${accountsPages.length} page(s) depuis /me/accounts`);
        console.log("📋 Détail des pages /me/accounts:", accountsPages.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          role: p.role,
          tasks: p.tasks,
          has_access_token: !!p.access_token
        })));
        accountsPages.forEach(p => p.origin = 'accounts');

        // Fallback si /me/accounts retourne 0 résultat
        if (accountsPages.length === 0) {
          console.log("ℹ️ Fallback: /me?fields=accounts{...}");
          const meResponse: any = await new Promise((resolve, reject) => {
            window.FB.api(`/me?fields=accounts.limit(100){id,name,category,tasks,access_token,perms,role}`, (res: any) => {
              if (res && res.error) {
                console.error("   Erreur fallback /me:", res.error);
                resolve(null);
              } else {
                resolve(res);
              }
            });
          });
          if (meResponse?.accounts?.data) {
            accountsPages = meResponse.accounts.data.map((p: any) => ({ ...p, origin: 'accounts' }));
            console.log(`✅ Fallback /me → ${accountsPages.length} page(s)`);
          }
        }
      } catch (error: any) {
        console.error("❌ Erreur /me/accounts:", error?.message || error);
      }

      if (accountsPages.length === 0) {
        console.warn("⚠️ ATTENTION: Aucune page trouvée depuis /me/accounts");
        console.warn("Cela signifie probablement que :");
        console.warn("  1. Vous n'avez pas coché de pages dans le popup Facebook");
        console.warn("  2. Votre rôle sur les pages est insuffisant (Analyst/Advertiser)");
        console.warn("  3. Les pages n'ont pas été correctement autorisées");
      }

      // Récupérer les pages depuis /me/assigned_pages (Business Manager)
      console.log("📥 Récupération depuis /me/assigned_pages (Business Manager)...");
      let assignedPages: any[] = [];
      try {
        assignedPages = await fetchAllPages(
          `/me/assigned_pages?fields=id,name,category,permitted_tasks,access_token,perms,role&limit=100`,
          userAccessToken
        );
        console.log(`✅ ${assignedPages.length} page(s) depuis /me/assigned_pages (Business Manager)`);
        assignedPages.forEach(p => {
          p.origin = 'assigned';
          // Normaliser permitted_tasks vers tasks
          if (p.permitted_tasks && !p.tasks) {
            p.tasks = p.permitted_tasks;
          }
        });
      } catch (error: any) {
        console.error("⚠️ Erreur /me/assigned_pages:", error?.message || error);
        // Ne pas bloquer si cette API échoue (normal si pas de Business Manager)
      }

      // Récupérer les Business et leurs pages (owned et client)
      console.log("📥 Récupération des Business et pages associées...");
      let businessOwnedPages: any[] = [];
      let businessClientPages: any[] = [];
      try {
        const businesses = await fetchAllPages(`/me/businesses?fields=id,name&limit=100`, userAccessToken);
        console.log(`✅ ${businesses.length} business(es) trouvé(s)`);
        for (const b of businesses) {
          try {
            const owned = await fetchAllPages(`/${b.id}/owned_pages?fields=id,name,category,permitted_tasks,tasks,access_token,perms,role&limit=100`, userAccessToken);
            owned.forEach((p: any) => {
              p.origin = 'business_owned';
              if (p.permitted_tasks && !p.tasks) p.tasks = p.permitted_tasks;
            });
            businessOwnedPages = businessOwnedPages.concat(owned);
            console.log(`   🏢 Business ${b.name}: ${owned.length} owned_pages`);
          } catch (e) {
            console.warn(`   ⚠️ Erreur owned_pages pour le business ${b.name}:`, (e as any)?.message || e);
          }
          try {
            const client = await fetchAllPages(`/${b.id}/client_pages?fields=id,name,category,permitted_tasks,tasks,access_token,perms,role&limit=100`, userAccessToken);
            client.forEach((p: any) => {
              p.origin = 'business_client';
              if (p.permitted_tasks && !p.tasks) p.tasks = p.permitted_tasks;
            });
            businessClientPages = businessClientPages.concat(client);
            console.log(`   🤝 Business ${b.name}: ${client.length} client_pages`);
          } catch (e) {
            console.warn(`   ⚠️ Erreur client_pages pour le business ${b.name}:`, (e as any)?.message || e);
          }
        }
      } catch (error: any) {
        console.warn("ℹ️ Aucun business trouvé ou accès refusé:", error?.message || error);
      }

      // Fusionner et dédupliquer les pages
      const allPagesMap = new Map();
      [...accountsPages, ...assignedPages, ...businessOwnedPages, ...businessClientPages].forEach(page => {
        if (!allPagesMap.has(page.id)) {
          allPagesMap.set(page.id, page);
        } else {
          // Si la page existe déjà, privilégier celle avec access_token
          const existing = allPagesMap.get(page.id);
          if (page.access_token && !existing.access_token) {
            allPagesMap.set(page.id, page);
          }
        }
      });

      const pages = {
        data: Array.from(allPagesMap.values())
      };

      console.log("🔍 Réponse agrégée finale:", {
        total: pages.data.length,
        from_accounts: accountsPages.length,
        from_assigned: assignedPages.length,
        from_business_owned: businessOwnedPages.length,
        from_business_client: businessClientPages.length,
        pages: pages.data.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          role: p.role,
          perms: p.perms,
          tasks: p.tasks,
          origin: p.origin,
          has_token: !!p.access_token
        }))
      });

      console.log("");
      console.log("🔎 DIAGNOSTIC COMPLET :");
      console.log(`   📊 Total de pages agrégées: ${pages.data.length}`);
      console.log(`   📄 Pages personnelles (/me/accounts): ${accountsPages.length}`);
      console.log(`   🏢 Pages Business Manager: ${assignedPages.length}`);
      console.log(`   🏪 Pages Business owned: ${businessOwnedPages.length}`);
      console.log(`   🤝 Pages Business client: ${businessClientPages.length}`);
      console.log("");
      if (pages.data.length === 0) {
        console.error("❌ PROBLÈME: Aucune page n'a été trouvée !");
        console.error("   Avez-vous bien COCHÉ vos pages dans le popup Facebook ?");
        console.error("   Vérifiez votre rôle sur les pages (Admin/Editor/Moderator requis)");
      }

      if (!pages.data || pages.data.length === 0) {
        console.error("❌ Aucune page Facebook accessible trouvée");
        console.log("");
        console.log("📋 Checklist de dépannage :");
        console.log("1. Vous n'avez pas cliqué sur 'Continuer en tant que...' lors de la connexion");
        console.log("2. Vous n'avez pas coché les pages dans la popup Facebook");
        console.log("3. Vous n'avez pas 'Facebook access – Full control' sur vos pages");
        console.log("4. Les permissions de l'app ne sont pas approuvées en production");
        console.log("5. Votre compte nécessite l'authentification à deux facteurs (2FA)");
        console.log("6. Vous n'avez pas le rôle Admin/Editor/Moderator sur vos pages (requis par l'API)");
        console.log("");
        console.log("🏢 Pour les pages Business Manager :");
        console.log("   • Vérifiez que vous êtes bien ajouté au Business Manager");
        console.log("   • Vérifiez vos permissions sur la page (Tâches : Créer du contenu ou Contrôle total)");
        console.log("   • Allez dans Business Settings → Pages → Vérifier les attributions");
        console.log("");
        console.log("🔍 DIAGNOSTIC - Rôles Facebook Pages:");
        console.log("   ✅ Admin, Editor, Moderator → Page accessible via API");
        console.log("   ❌ Analyst, Advertiser → Page NON accessible via API");
        console.log("   📝 Pour changer votre rôle : Page Settings → Page Access");
        
        toast({
          title: "Aucune page trouvée",
          description: "Les pages cochées dans le popup ne sont pas accessibles. Vérifiez votre rôle (Admin/Editor/Moderator requis) et réessayez.",
          variant: "destructive",
        });
        
        setLoading(false);
        return;
      }

      // Afficher un message si des pages Business ont été trouvées
      if (assignedPages.length > 0) {
        console.log(`✨ ${assignedPages.length} page(s) Business Manager ajoutée(s)`);
      }

      // Connecter automatiquement la première page autorisée
      console.log(`✅ ${pages.data.length} page(s) autorisée(s), connexion automatique...`);
      const primaryPage = pages.data[0];
      await connectSinglePage(primaryPage, userAccessToken);

      // Afficher un message informatif si plusieurs pages étaient disponibles
      if (pages.data.length > 1) {
        toast({
          title: "✅ Page connectée",
          description: `${primaryPage.name} a été connectée comme page principale. ${pages.data.length - 1} autre(s) page(s) disponible(s).`,
        });
      } else {
        toast({
          title: "✅ Page connectée",
          description: `${primaryPage.name} a été connectée avec succès.`,
        });
      }
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
        origin: page.origin,
        tasks: page.tasks,
        role: page.role
      });

      // Étape 4: Obtenir un token de page longue durée
      console.log("Obtention du token de page longue durée...");
      const longLivedPageTokenResponse = await fetch(
        `https://graph.facebook.com/v23.0/${page.id}?` +
        `fields=access_token&` +
        `access_token=${userAccessToken}`
      );

      if (!longLivedPageTokenResponse.ok) {
        const errorData = await longLivedPageTokenResponse.json();
        console.error("❌ Erreur obtention token de page:", errorData);
        const fbMessage = errorData?.error?.message || "Erreur inconnue";
        if (fbMessage.includes('Unsupported get request')) {
          throw new Error("Facebook renvoie 'Unsupported get request'. Vérifiez que vous avez bien coché la page lors de l'autorisation et que vous avez les permissions requises.");
        } else if (errorData?.error?.code === 10 || /permission/i.test(fbMessage)) {
          throw new Error("Permissions insuffisantes pour obtenir le token de page. Assurez-vous d'avoir 'Facebook access – Full control' ou 'Create content' sur la page.");
        } else {
          throw new Error(`Impossible d'obtenir le token de page: ${fbMessage}`);
        }
      }

      const pageTokenData = await longLivedPageTokenResponse.json();
      const pageToken = pageTokenData.access_token;

      if (!pageToken) {
        throw new Error("Token de page non trouvé dans la réponse");
      }

      // Étape 5: Valider le token de page
      console.log("Validation du token de page...");
      const tokenValidationResponse = await fetch(
        `https://graph.facebook.com/v23.0/me?access_token=${pageToken}`
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
        `https://graph.facebook.com/v23.0/${profile.facebook_page_id}?fields=id,name&access_token=${profile.facebook_access_token}`
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
        `https://graph.facebook.com/v23.0/${profile.facebook_page_id}?fields=instagram_business_account&access_token=${profile.facebook_access_token}`
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
        `https://graph.facebook.com/v23.0/${data.instagram_business_account.id}?fields=id,username&access_token=${profile.facebook_access_token}`
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
    connectInstagram
  };
};

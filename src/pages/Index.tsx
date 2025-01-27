import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { CentrisImport } from "@/components/CentrisImport";
import { ListingsList } from "@/components/ListingsList";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fbInitialized, setFbInitialized] = useState(false);

  useEffect(() => {
    getProfile();
    loadFacebookSDK();
  }, []);

  const loadFacebookSDK = async () => {
    try {
      // Create and append the Facebook SDK script
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      // Wait for the script to load and FB to be defined
      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          // Check for FB object periodically
          const checkFB = setInterval(() => {
            if (window.FB) {
              clearInterval(checkFB);
              try {
                window.FB.init({
                  appId: '3819439438267773',
                  version: 'v18.0',
                  cookie: true,
                  xfbml: true
                });
                setFbInitialized(true);
                console.log('Facebook SDK initialized successfully');
                resolve();
              } catch (initError) {
                console.error('Error during FB.init:', initError);
                reject(initError);
              }
            }
          }, 100);

          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkFB);
            reject(new Error('Facebook SDK initialization timed out'));
          }, 10000);
        };

        script.onerror = () => reject(new Error('Failed to load Facebook SDK script'));
      });

    } catch (error) {
      console.error('Error initializing Facebook SDK:', error);
      // Only show toast for actual errors, not for content blocker related issues
      if (error.message !== "Failed to call url") {
        toast({
          title: "Avertissement",
          description: "L'initialisation de Facebook pourrait être bloquée par votre navigateur. La connexion pourrait ne pas fonctionner correctement.",
          variant: "destructive",
        });
      }
    }
  };

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
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
      if (profile?.facebook_page_id) {
        const { error: resetError } = await supabase
          .from('profiles')
          .update({
            facebook_page_id: null,
            facebook_access_token: null,
            instagram_user_id: null,
            instagram_access_token: null
          })
          .eq('id', profile.id);

        if (resetError) throw resetError;
      }

      const response = await new Promise<fb.AuthResponse>((resolve) => {
        window.FB.login((response) => {
          resolve(response);
        }, {
          scope: 'pages_manage_posts,pages_read_engagement,pages_show_list,instagram_basic,instagram_content_publish',
          auth_type: 'reauthorize'
        });
      });

      if (response.status === 'connected') {
        const pages = await new Promise<any>((resolve) => {
          window.FB.api('/me/accounts', (response) => {
            resolve(response);
          });
        });

        if (pages.data && pages.data.length > 0) {
          const page = pages.data[0];
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              facebook_page_id: page.id,
              facebook_access_token: page.access_token
            })
            .eq('id', profile.id);

          if (updateError) throw updateError;

          toast({
            title: "Succès",
            description: "Votre page Facebook a été reconnectée avec succès",
          });

          getProfile();
        }
      }
    } catch (error) {
      console.error('Facebook connection error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de connecter votre page Facebook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectInstagram = async () => {
    if (!fbInitialized || !profile?.facebook_page_id || !profile?.facebook_access_token) {
      toast({
        title: "Erreur",
        description: "Vous devez d'abord connecter votre page Facebook",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${profile.facebook_page_id}?fields=instagram_business_account&access_token=${profile.facebook_access_token}`
      );
      
      const data = await response.json();
      
      if (!data.instagram_business_account?.id) {
        toast({
          title: "Erreur",
          description: "Aucun compte Instagram professionnel n'est associé à votre page Facebook. Veuillez d'abord connecter un compte Instagram professionnel à votre page Facebook.",
          variant: "destructive",
        });
        return;
      }

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
        description: "Votre compte Instagram a été connecté avec succès",
      });

      getProfile();
    } catch (error) {
      console.error('Instagram connection error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de connecter votre compte Instagram",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <HeroSection 
        profile={profile} 
        loading={loading} 
        onConnectFacebook={connectFacebook}
        onConnectInstagram={connectInstagram}
      />
      {profile?.facebook_page_id && (
        <div className="container mx-auto py-8 space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Importer une annonce Centris</h2>
            <CentrisImport />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Vos annonces</h2>
            <ListingsList />
          </div>
        </div>
      )}
      <FeaturesSection />
      <PricingSection />
    </div>
  );
};

export default Index;
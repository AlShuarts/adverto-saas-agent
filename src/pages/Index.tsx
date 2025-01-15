import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { CentrisImport } from "@/components/CentrisImport";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

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
    setLoading(true);
    try {
      await new Promise<void>((resolve) => {
        window.FB.init({
          appId: '3819439438267773',
          version: 'v18.0'
        });
        resolve();
      });

      const response = await new Promise<fb.AuthResponse>((resolve) => {
        window.FB.login((response) => {
          resolve(response);
        }, {
          scope: 'pages_manage_posts,pages_read_engagement,pages_show_list'
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
            description: "Votre page Facebook a été connectée avec succès",
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

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <HeroSection 
        profile={profile} 
        loading={loading} 
        onConnectFacebook={connectFacebook} 
      />
      {profile?.facebook_page_id && (
        <div className="container mx-auto py-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Importer une annonce Centris</h2>
          <CentrisImport />
        </div>
      )}
      <FeaturesSection />
      <PricingSection />
    </div>
  );
};

export default Index;
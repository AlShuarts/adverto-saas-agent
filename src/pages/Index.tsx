
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ListingsSection } from "@/components/ListingsSection";
import { useFacebookSDK } from "@/hooks/useFacebookSDK";
import { useProfile } from "@/hooks/useProfile";
import { useFacebookTokenChecker } from "@/hooks/useFacebookTokenChecker";
import { Toaster } from "sonner";

const Index = () => {
  const { fbInitialized } = useFacebookSDK();
  const { profile, loading, getProfile, handleFacebookLoginResponse, connectInstagram } = useProfile();
  useFacebookTokenChecker();

  // Assurer que le profil est chargé au démarrage
  useEffect(() => {
    if (!profile && !loading) {
      getProfile();
    }
  }, [profile, loading, getProfile]);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <HeroSection 
        profile={profile} 
        loading={loading} 
        onConnectInstagram={connectInstagram}
      />
      <ListingsSection />
      <FeaturesSection />
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;

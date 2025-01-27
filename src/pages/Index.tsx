import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { ListingsSection } from "@/components/ListingsSection";
import { useFacebookSDK } from "@/hooks/useFacebookSDK";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const { fbInitialized } = useFacebookSDK();
  const { profile, loading, getProfile, connectFacebook, connectInstagram } = useProfile();

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <HeroSection 
        profile={profile} 
        loading={loading} 
        onConnectFacebook={connectFacebook}
        onConnectInstagram={connectInstagram}
      />
      {profile?.facebook_page_id && <ListingsSection />}
      <FeaturesSection />
      <PricingSection />
    </div>
  );
};

export default Index;
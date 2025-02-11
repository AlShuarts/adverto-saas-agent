
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ListingsSection } from "@/components/ListingsSection";
import { useFacebookSDK } from "@/hooks/useFacebookSDK";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { fbInitialized } = useFacebookSDK();
  const { profile, loading, getProfile, connectFacebook, connectInstagram } = useProfile();
  const { toast } = useToast();

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
      <ListingsSection />
      <FeaturesSection />
    </div>
  );
};

export default Index;

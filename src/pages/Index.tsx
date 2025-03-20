
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ListingsSection } from "@/components/ListingsSection";
import { useFacebookSDK } from "@/hooks/useFacebookSDK";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Index = () => {
  const { fbInitialized } = useFacebookSDK();
  const { profile, loading, getProfile, connectFacebook, connectInstagram } = useProfile();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="flex-1 flex relative">
        {(sidebarOpen || !isMobile) && (
          <div className={`${isMobile ? "absolute z-50 h-full" : ""}`}>
            <Sidebar />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <Navbar>
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </Navbar>
          <div className="overflow-y-auto">
            <HeroSection 
              profile={profile} 
              loading={loading} 
              onConnectFacebook={connectFacebook}
              onConnectInstagram={connectInstagram}
            />
            <ListingsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/AppSidebar";
import { SocialAccountsStatus } from "@/components/social/SocialAccountsStatus";
import { SocialPublishingList } from "@/components/social/SocialPublishingList";

const SocialPublishing = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-secondary flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Publication Sociale</h1>
          <p className="text-center text-muted-foreground mb-8">
            Publiez vos listings sur vos réseaux sociaux en quelques clics
          </p>
          <SocialAccountsStatus />
          <div className="mt-8">
            <SocialPublishingList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPublishing;

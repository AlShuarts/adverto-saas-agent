import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";
import { QuickImport } from "@/components/dashboard/QuickImport";
import { RecentListings } from "@/components/dashboard/RecentListings";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useFacebookSDK } from "@/hooks/useFacebookSDK";
import { useProfile } from "@/hooks/useProfile";
import { useFacebookTokenChecker } from "@/hooks/useFacebookTokenChecker";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";

const Index = () => {
  const { fbInitialized } = useFacebookSDK();
  const { profile, loading, getProfile, connectInstagram, disconnectFacebook, disconnectInstagram } = useProfile();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [firstName, setFirstName] = useState<string | null>(null);
  useFacebookTokenChecker();

  useEffect(() => {
    if (!profile && !loading) {
      getProfile();
    }
  }, [profile, loading, getProfile]);

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.first_name) {
        setFirstName(user.user_metadata.first_name);
      } else if (profile?.first_name) {
        setFirstName(profile.first_name);
      }
    };
    fetchUserName();
  }, [profile]);

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {firstName ? `Bonjour, ${firstName} 👋` : "Tableau de bord"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos annonces et publications sur les réseaux sociaux
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Connection Status */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Connexions
          </h2>
          <ConnectionStatus 
            profile={profile}
            loading={loading}
            fbInitialized={fbInitialized}
            onConnectInstagram={connectInstagram}
            onDisconnectFacebook={disconnectFacebook}
            onDisconnectInstagram={disconnectInstagram}
          />
        </div>

        {/* Quick Import */}
        <QuickImport onImportSuccess={handleImportSuccess} />

        {/* Recent Listings */}
        <RecentListings refreshTrigger={refreshTrigger} />
      </div>
      <Toaster position="top-right" />
    </MainLayout>
  );
};

export default Index;

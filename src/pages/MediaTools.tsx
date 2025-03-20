
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/AppSidebar";
import { MediaToolsList } from "@/components/media/MediaToolsList";

const MediaTools = () => {
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
          <h1 className="text-3xl font-bold mb-8 text-center">Outils Média</h1>
          <p className="text-center text-muted-foreground mb-8">
            Créez des diaporamas, bannières et autres contenus visuels pour vos listings
          </p>
          <MediaToolsList />
        </div>
      </div>
    </div>
  );
};

export default MediaTools;

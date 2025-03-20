
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/AppSidebar";
import { MediaToolsList } from "@/components/media/MediaToolsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const MediaTools = () => {
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
          <div className="container mx-auto py-6 px-4 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4">Outils Média</h1>
            <p className="text-muted-foreground mb-6">
              Créez des diaporamas, bannières et autres contenus visuels
            </p>
            <MediaToolsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaTools;

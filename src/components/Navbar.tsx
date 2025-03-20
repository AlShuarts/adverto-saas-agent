
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Home, BookMarked } from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-2xl flex items-center">
            <span className="hidden md:inline">ImmoSocial</span>
            <span className="inline md:hidden">IS</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Accueil</span>
            </Button>
          </Link>
          
          <Link to="/published-listings">
            <Button variant="ghost" size="sm">
              <BookMarked className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Publiés</span>
            </Button>
          </Link>

          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Profil</span>
            </Button>
          </Link>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

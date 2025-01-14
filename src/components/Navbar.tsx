import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LogIn } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">ImmoAds</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/auth">
            <Button variant="ghost" className="flex items-center space-x-2">
              <LogIn className="h-4 w-4" />
              <span>Connexion</span>
            </Button>
          </Link>
          <Link to="/auth?signup=true">
            <Button>Commencer</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
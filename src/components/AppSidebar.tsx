
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Image, 
  Share, 
  BookMarked, 
  User, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems = [
    {
      icon: Home,
      label: "Accueil",
      path: "/",
    },
    {
      icon: Image,
      label: "Outils Média",
      path: "/media",
    },
    {
      icon: Share,
      label: "Publication",
      path: "/social",
    },
    {
      icon: BookMarked,
      label: "Listings Publiés",
      path: "/published-listings",
    },
    {
      icon: User,
      label: "Profil",
      path: "/profile",
    },
    {
      icon: HelpCircle,
      label: "Aide",
      path: "/help",
    },
  ];

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border relative transition-all duration-300 flex flex-col",
      isCollapsed ? "w-[64px]" : "w-[240px]"
    )}>
      <div className="p-4 flex items-center gap-3 border-b border-border h-16">
        {!isCollapsed && (
          <h1 className="text-xl font-bold">ImmoSocial</h1>
        )}
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path && "bg-accent text-accent-foreground"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

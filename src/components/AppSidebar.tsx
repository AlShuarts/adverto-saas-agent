
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Image, 
  Share, 
  BookMarked, 
  User, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Auto-collapse on mobile
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const sidebarItems = [
    {
      icon: Home,
      label: "Accueil",
      path: "/",
    },
    {
      icon: BookMarked,
      label: "Listings",
      path: "/published-listings",
    },
    {
      icon: Image,
      label: "Média",
      path: "/media",
    },
    {
      icon: Share,
      label: "Social",
      path: "/social",
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
      "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
      isCollapsed ? "w-[60px]" : "w-[200px]"
    )}>
      <div className="p-3 flex items-center gap-2 border-b border-border h-14">
        {!isCollapsed && (
          <h1 className="text-base font-bold">ImmoSocial</h1>
        )}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={() => setIsCollapsed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start h-9",
                  location.pathname === item.path && "bg-accent text-accent-foreground"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      {!isMobile && (
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
      )}
    </div>
  );
};

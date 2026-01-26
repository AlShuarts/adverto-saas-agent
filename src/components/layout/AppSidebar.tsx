import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Building2, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type NavItem = {
  title: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { title: "Tableau de bord", icon: LayoutDashboard, path: "/" },
  { title: "Mes annonces", icon: Building2, path: "/listings" },
  { title: "Mon profil", icon: User, path: "/profile" },
  { title: "Administration", icon: Shield, path: "/admin", adminOnly: true },
];

// Composant de navigation interne
const SidebarContent = ({ 
  collapsed, 
  setCollapsed, 
  isAdmin, 
  onNavigate,
  showCollapse = true
}: { 
  collapsed: boolean;
  setCollapsed?: (v: boolean) => void;
  isAdmin: boolean;
  onNavigate: (path: string) => void;
  showCollapse?: boolean;
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNavigate("/auth");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <span className="text-xl font-bold text-primary">ImmoAds</span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-primary">IA</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            const button = (
              <Button
                key={item.path}
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  active && "bg-primary/10 text-primary hover:bg-primary/20",
                  collapsed && "justify-center px-0"
                )}
                onClick={() => onNavigate(item.path)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Button>
            );

            if (collapsed && showCollapse) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        {/* Collapse button - only on desktop */}
        {showCollapse && setCollapsed && (
          <div className="px-2 pb-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("w-full", collapsed && "justify-center px-0")}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Réduire</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Sign out */}
        <div className="border-t border-border p-2">
          {collapsed && showCollapse ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-0 h-11 text-muted-foreground hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                Déconnexion
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export const AppSidebar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase.rpc('has_role', { 
          _role: 'admin', 
          _user_id: user.id 
        });
        setIsAdmin(!!data);
      }
    };
    getUser();
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Mobile: Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50 bg-card border border-border shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent
            collapsed={false}
            isAdmin={isAdmin}
            onNavigate={handleNavigate}
            showCollapse={false}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Sidebar classique
  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isAdmin={isAdmin}
        onNavigate={handleNavigate}
        showCollapse={true}
      />
    </aside>
  );
};

import { useEffect, useRef } from "react";
import { Facebook, Instagram, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type ConnectionStatusProps = {
  profile: Tables<"profiles"> | null;
  loading: boolean;
  fbInitialized: boolean;
  onConnectInstagram: () => void;
  onDisconnectFacebook: () => void;
  onDisconnectInstagram: () => void;
};

export const ConnectionStatus = ({ 
  profile, 
  loading, 
  fbInitialized,
  onConnectInstagram,
  onDisconnectFacebook,
  onDisconnectInstagram
}: ConnectionStatusProps) => {
  const facebookConnected = !!profile?.facebook_page_id;
  const instagramConnected = !!profile?.instagram_user_id;
  const fbButtonRef = useRef<HTMLDivElement>(null);

  // Force Facebook SDK to parse the button when component mounts
  useEffect(() => {
    if (fbInitialized && !facebookConnected && (window as any).FB?.XFBML) {
      (window as any).FB.XFBML.parse(fbButtonRef.current?.parentElement);
    }
  }, [fbInitialized, facebookConnected]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Facebook Card */}
      <Card className={cn(
        "border-2 transition-colors",
        facebookConnected ? "border-green-500/30 bg-green-500/5" : "border-border"
      )}>
        <CardContent className="p-3 sm:p-5">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={cn(
                "p-2 sm:p-2.5 rounded-lg shrink-0",
                facebookConnected ? "bg-green-500/20" : "bg-muted"
              )}>
                <Facebook className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  facebookConnected ? "text-green-500" : "text-muted-foreground"
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-medium text-foreground">Facebook</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {facebookConnected ? "Connecté" : "Non connecté"}
                </p>
              </div>
            </div>
            {facebookConnected ? (
              <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-end">
                <span className="text-xs sm:text-sm text-green-600 font-medium truncate max-w-[100px] sm:max-w-[120px]" title={(profile as any)?.facebook_page_name}>
                  {(profile as any)?.facebook_page_name || "Connecté"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive shrink-0"
                  onClick={onDisconnectFacebook}
                  disabled={loading}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <div ref={fbButtonRef} className="w-full xs:w-auto">
                {!fbInitialized ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <div 
                    className="fb-login-button" 
                    data-config-id="809471798372780"
                    data-size="large"
                    data-button-type="continue_with"
                    data-layout="default"
                    data-auto-logout-link="false"
                    data-use-continue-as="true"
                    data-onlogin="checkFacebookLoginState"
                  />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instagram Card */}
      <Card className={cn(
        "border-2 transition-colors",
        instagramConnected ? "border-pink-500/30 bg-pink-500/5" : "border-border"
      )}>
        <CardContent className="p-3 sm:p-5">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={cn(
                "p-2 sm:p-2.5 rounded-lg shrink-0",
                instagramConnected ? "bg-pink-500/20" : "bg-muted"
              )}>
                <Instagram className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  instagramConnected ? "text-pink-500" : "text-muted-foreground"
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-medium text-foreground">Instagram</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {instagramConnected ? "Connecté" : "Non connecté"}
                </p>
              </div>
            </div>
            {instagramConnected ? (
              <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-end">
                <span className="text-xs sm:text-sm text-pink-600 font-medium truncate max-w-[100px] sm:max-w-[120px]" 
                      title={`@${(profile as any)?.instagram_username}`}>
                  @{(profile as any)?.instagram_username || "Connecté"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive shrink-0"
                  onClick={onDisconnectInstagram}
                  disabled={loading}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onConnectInstagram}
                disabled={!facebookConnected || loading}
                className="w-full xs:w-auto"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Connecter"
                )}
              </Button>
            )}
          </div>
          {!facebookConnected && !instagramConnected && (
            <p className="text-xs text-muted-foreground mt-3">
              Connectez d'abord Facebook
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

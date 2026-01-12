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
};

export const ConnectionStatus = ({ 
  profile, 
  loading, 
  fbInitialized,
  onConnectInstagram 
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Facebook Card */}
      <Card className={cn(
        "border-2 transition-colors",
        facebookConnected ? "border-green-500/30 bg-green-500/5" : "border-border"
      )}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-lg",
                facebookConnected ? "bg-green-500/20" : "bg-muted"
              )}>
                <Facebook className={cn(
                  "h-5 w-5",
                  facebookConnected ? "text-green-500" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium text-foreground">Facebook</p>
                <p className="text-sm text-muted-foreground">
                  {facebookConnected ? "Connecté" : "Non connecté"}
                </p>
              </div>
            </div>
            {facebookConnected ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {(profile as any)?.facebook_page_name && (
                  <span className="text-sm text-green-600 font-medium truncate max-w-[120px]" title={(profile as any).facebook_page_name}>
                    {(profile as any).facebook_page_name}
                  </span>
                )}
              </div>
            ) : (
              <div ref={fbButtonRef}>
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
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-lg",
                instagramConnected ? "bg-pink-500/20" : "bg-muted"
              )}>
                <Instagram className={cn(
                  "h-5 w-5",
                  instagramConnected ? "text-pink-500" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium text-foreground">Instagram</p>
                <p className="text-sm text-muted-foreground">
                  {instagramConnected ? "Connecté" : "Non connecté"}
                </p>
              </div>
            </div>
            {instagramConnected ? (
              <CheckCircle2 className="h-5 w-5 text-pink-500" />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onConnectInstagram}
                disabled={!facebookConnected || loading}
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

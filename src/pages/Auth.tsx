import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, LogIn, UserPlus, Video, Image, Share2, Sparkles, Shield, Zap } from "lucide-react";
import type { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
  const isSignUp = searchParams.get("signup") === "true";

  const toggleMode = (mode: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (mode === "signup") {
      newParams.set("signup", "true");
    } else {
      newParams.delete("signup");
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(from, { replace: true });
      }
    };
    
    checkExistingSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate(from, { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, from]);

  const getErrorMessage = (error: AuthError) => {
    try {
      const errorBody = JSON.parse(error.message);
      if (errorBody.code === "weak_password") {
        return "Le mot de passe doit contenir au moins 6 caractères.";
      }
      if (errorBody.code === "invalid_credentials") {
        return "Email ou mot de passe incorrect.";
      }
    } catch {
      // If error message is not JSON parseable, use the original message
    }
    
    switch (error.message) {
      case "User already registered":
        return "Cette adresse email est déjà utilisée.";
      case "Invalid login credentials":
        return "Email ou mot de passe incorrect.";
      default:
        return error.message;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setErrorMessage("");
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "USER_UPDATED" && !session) {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(getErrorMessage(error));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const features = [
    {
      icon: Video,
      title: "Diaporamas automatiques",
      description: "Créez des vidéos professionnelles en quelques clics"
    },
    {
      icon: Image,
      title: "Bannières personnalisées",
      description: "Générez des visuels avec votre branding"
    },
    {
      icon: Share2,
      title: "Multi-réseaux",
      description: "Publiez sur Facebook et Instagram simultanément"
    },
    {
      icon: Sparkles,
      title: "Textes IA",
      description: "Descriptions générées automatiquement"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <Home className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">ImmoAds</h1>
              <p className="text-sm text-muted-foreground">Marketing immobilier automatisé</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-4">
              Automatisez vos
              <span className="block text-primary">publicités immobilières</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Créez des diaporamas, bannières et publications pour vos propriétés en quelques clics.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Configuration rapide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ImmoAds</h1>
            </div>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/5">
            <CardContent className="p-6 lg:p-8">
              {/* Tabs */}
              <Tabs 
                value={isSignUp ? "signup" : "signin"} 
                onValueChange={toggleMode}
                className="mb-6"
              >
                <TabsList className="w-full grid grid-cols-2 h-12 bg-secondary/50">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Inscription
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {isSignUp ? "Créer un compte" : "Bon retour !"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isSignUp
                    ? "Commencez à automatiser vos publicités"
                    : "Connectez-vous pour continuer"}
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Auth Form */}
              <SupabaseAuth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "hsl(217.2 91.2% 59.8%)",
                        brandAccent: "hsl(217.2 91.2% 50%)",
                        inputBackground: "hsl(217.2 32.6% 12%)",
                        inputText: "hsl(210 40% 98%)",
                        inputBorder: "hsl(217.2 32.6% 20%)",
                        inputBorderFocus: "hsl(217.2 91.2% 59.8%)",
                        inputBorderHover: "hsl(217.2 32.6% 25%)",
                        inputPlaceholder: "hsl(215 20.2% 50%)",
                      },
                      fonts: {
                        bodyFontFamily: "Inter, sans-serif",
                        buttonFontFamily: "Inter, sans-serif",
                        inputFontFamily: "Inter, sans-serif",
                        labelFontFamily: "Inter, sans-serif",
                      },
                      fontSizes: {
                        baseBodySize: "14px",
                        baseInputSize: "14px",
                        baseLabelSize: "14px",
                        baseButtonSize: "14px",
                      },
                      space: {
                        inputPadding: "12px 16px",
                        buttonPadding: "12px 16px",
                      },
                      borderWidths: {
                        buttonBorderWidth: "0px",
                        inputBorderWidth: "1px",
                      },
                      radii: {
                        borderRadiusButton: "8px",
                        buttonBorderRadius: "8px",
                        inputBorderRadius: "8px",
                      },
                    },
                  },
                  className: {
                    container: "space-y-4",
                    button: "w-full py-3 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow",
                    input: "!bg-secondary/50 !border-border focus:!border-primary focus:!ring-2 focus:!ring-primary/20",
                    label: "text-sm font-medium text-foreground mb-2",
                    anchor: "text-primary hover:text-primary/80 text-sm",
                    message: "text-destructive text-sm",
                  }
                }}
                providers={[]}
                view={isSignUp ? "sign_up" : "sign_in"}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: "Adresse email",
                      password_label: "Mot de passe",
                      button_label: "Se connecter",
                      loading_button_label: "Connexion en cours...",
                      link_text: "",
                    },
                    sign_up: {
                      email_label: "Adresse email",
                      password_label: "Mot de passe",
                      button_label: "Créer mon compte",
                      loading_button_label: "Création en cours...",
                      link_text: "",
                    },
                    forgotten_password: {
                      email_label: "Adresse email",
                      button_label: "Envoyer les instructions",
                      loading_button_label: "Envoi en cours...",
                      link_text: "Mot de passe oublié ?",
                    },
                    update_password: {
                      password_label: "Nouveau mot de passe",
                      button_label: "Mettre à jour",
                      loading_button_label: "Mise à jour en cours...",
                    },
                  },
                }}
              />

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  En continuant, vous acceptez nos{" "}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    conditions d'utilisation
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile features hint */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Créez des contenus professionnels
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Video className="w-4 h-4 text-primary" />
                <span>Diaporamas</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Image className="w-4 h-4 text-primary" />
                <span>Bannières</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Share2 className="w-4 h-4 text-primary" />
                <span>Réseaux</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

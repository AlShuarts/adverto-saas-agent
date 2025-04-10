
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import type { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
  const isSignUp = searchParams.get("signup") === "true";

  const toggleMode = () => {
    const newParams = new URLSearchParams(searchParams);
    if (isSignUp) {
      newParams.delete("signup");
    } else {
      newParams.set("signup", "true");
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
    
    // Default error messages based on error code
    switch (error.message) {
      case "User already registered":
        return "Cette adresse email est déjà utilisée.";
      case "Invalid login credentials":
        return "Email ou mot de passe incorrect.";
      default:
        return error.message;
    }
  };

  // Add error handling through auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setErrorMessage("");
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    // Listen for auth errors
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

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-6 glass rounded-lg overflow-hidden border-0">
        <div className="flex w-full border-b border-border/10">
          <Button 
            variant={isSignUp ? "ghost" : "secondary"}
            className={`w-1/2 rounded-none py-6 text-base ${!isSignUp ? "bg-primary/20" : ""}`}
            onClick={() => isSignUp && toggleMode()}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Se connecter
          </Button>
          <Button 
            variant={!isSignUp ? "ghost" : "secondary"}
            className={`w-1/2 rounded-none py-6 text-base ${isSignUp ? "bg-primary/20" : ""}`}
            onClick={() => !isSignUp && toggleMode()}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Créer un compte
          </Button>
        </div>

        <CardHeader>
          <h2 className="text-3xl font-bold text-center">
            {isSignUp ? "Créer un compte" : "Se connecter"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {isSignUp
              ? "Commencez à automatiser vos publicités immobilières"
              : "Connectez-vous à votre compte"}
          </p>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "rgb(var(--primary))",
                    brandAccent: "rgb(var(--primary))",
                  },
                },
              },
              className: {
                container: "space-y-4",
                button: "w-full py-3 font-medium",
                input: "rounded-md px-4 py-3",
                label: "text-sm font-medium mb-1",
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
                  link_text: "Pas encore de compte? Inscrivez-vous",
                },
                sign_up: {
                  email_label: "Adresse email",
                  password_label: "Mot de passe",
                  button_label: "Créer un compte",
                  loading_button_label: "Inscription en cours...",
                  link_text: "Déjà un compte? Connectez-vous",
                },
                forgotten_password: {
                  email_label: "Adresse email",
                  button_label: "Envoyer les instructions",
                  loading_button_label: "Envoi en cours...",
                  link_text: "Réinitialiser le mot de passe",
                },
                update_password: {
                  password_label: "Nouveau mot de passe",
                  button_label: "Mettre à jour le mot de passe",
                  loading_button_label: "Mise à jour en cours...",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate(from);
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

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 glass rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {searchParams.get("signup") ? "Créer un compte" : "Se connecter"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchParams.get("signup")
              ? "Commencez à automatiser vos publicités immobilières"
              : "Connectez-vous à votre compte"}
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
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
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "Adresse email",
                password_label: "Mot de passe",
                button_label: "Se connecter",
              },
              sign_up: {
                email_label: "Adresse email",
                password_label: "Mot de passe",
                button_label: "Créer un compte",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Auth;
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, RefreshCw } from "lucide-react";

interface HeroSectionProps {
  profile: any;
  loading: boolean;
  onConnectFacebook: () => void;
}

export const HeroSection = ({ profile, loading, onConnectFacebook }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-16 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          {profile ? `Bienvenue ${profile.first_name || ""}` : "Automatisez vos publicités immobilières sur Facebook"}
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Transformez vos annonces Centris en publicités Facebook attrayantes en quelques clics. Gagnez du temps et augmentez votre visibilité.
        </p>
        <div className="flex justify-center space-x-4">
          {!profile ? (
            <>
              <Button size="lg" className="animate-float" onClick={() => navigate("/auth")}>
                Essayer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Voir la démo
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              {!profile.facebook_page_id ? (
                <Button 
                  size="lg" 
                  className="animate-float"
                  onClick={onConnectFacebook}
                  disabled={loading}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  {loading ? "Connexion en cours..." : "Connecter ma page Facebook"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button size="lg" className="animate-float">
                    Commencer à publier
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onConnectFacebook}
                      disabled={loading}
                      className="mt-2"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {loading ? "Reconnexion en cours..." : "Reconnecter Facebook"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const connectFacebook = async () => {
    setLoading(true);
    try {
      // Initialiser le SDK Facebook
      await new Promise<void>((resolve) => {
        window.FB.init({
          appId: '421478844287454',
          version: 'v18.0'
        });
        resolve();
      });

      // Demander les permissions nécessaires
      const response = await new Promise<fb.AuthResponse>((resolve) => {
        window.FB.login((response) => {
          resolve(response);
        }, {
          scope: 'pages_manage_posts,pages_read_engagement,pages_show_list'
        });
      });

      if (response.status === 'connected') {
        // Récupérer la liste des pages
        const pages = await new Promise<any>((resolve) => {
          window.FB.api('/me/accounts', (response) => {
            resolve(response);
          });
        });

        if (pages.data && pages.data.length > 0) {
          const page = pages.data[0]; // Prendre la première page pour l'exemple
          
          // Mettre à jour le profil avec les informations Facebook
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              facebook_page_id: page.id,
              facebook_access_token: page.access_token
            })
            .eq('id', profile.id);

          if (updateError) throw updateError;

          toast({
            title: "Succès",
            description: "Votre page Facebook a été connectée avec succès",
          });

          // Recharger le profil
          getProfile();
        }
      }
    } catch (error) {
      console.error('Facebook connection error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de connecter votre page Facebook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      {/* Hero Section */}
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
                    onClick={connectFacebook}
                    disabled={loading}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    {loading ? "Connexion en cours..." : "Connecter ma page Facebook"}
                  </Button>
                ) : (
                  <Button size="lg" className="animate-float">
                    Commencer à publier
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-lg p-6">
              <Facebook className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Publication automatique
              </h3>
              <p className="text-gray-400">
                Publiez automatiquement vos annonces sur Facebook en quelques clics
              </p>
            </div>
            <div className="glass rounded-lg p-6">
              <Facebook className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Design professionnel
              </h3>
              <p className="text-gray-400">
                Des publicités créées automatiquement avec un design attrayant
              </p>
            </div>
            <div className="glass rounded-lg p-6">
              <Facebook className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Analyse des performances
              </h3>
              <p className="text-gray-400">
                Suivez les performances de vos publicités en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Des prix simples et transparents
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            <PricingCard
              title="Débutant"
              price="29"
              description="Parfait pour commencer"
              features={[
                "5 publicités par mois",
                "Publication automatique",
                "Support par email",
              ]}
            />
            <PricingCard
              title="Pro"
              price="79"
              description="Pour les professionnels"
              features={[
                "Publications illimitées",
                "Analytics avancés",
                "Support prioritaire",
                "Personnalisation avancée",
              ]}
              popular
            />
            <PricingCard
              title="Entreprise"
              price="199"
              description="Pour les grandes agences"
              features={[
                "Tout du plan Pro",
                "Multi-utilisateurs",
                "API access",
                "Account manager dédié",
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
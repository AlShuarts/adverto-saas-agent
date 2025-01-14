import { Navbar } from "@/components/Navbar";
import { PricingCard } from "@/components/PricingCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Automatisez vos publicités immobilières sur Facebook
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Transformez vos annonces Centris en publicités Facebook attrayantes en quelques clics. Gagnez du temps et augmentez votre visibilité.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="animate-float">
              Essayer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Voir la démo
            </Button>
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
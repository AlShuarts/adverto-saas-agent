import { PricingCard } from "@/components/PricingCard";

export const PricingSection = () => {
  return (
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
  );
};
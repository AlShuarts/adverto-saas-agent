import { Facebook } from "lucide-react";

export const FeaturesSection = () => {
  return (
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
  );
};
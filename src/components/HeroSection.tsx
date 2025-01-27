import { Button } from "@/components/ui/button";
import { Facebook, Instagram } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type HeroSectionProps = {
  profile: Tables<"profiles"> | null;
  loading: boolean;
  onConnectFacebook: () => void;
  onConnectInstagram?: () => void;
};

export const HeroSection = ({ profile, loading, onConnectFacebook, onConnectInstagram }: HeroSectionProps) => {
  const { toast } = useToast();

  const handleInstagramConnect = () => {
    if (!profile?.facebook_page_id) {
      toast({
        title: "Facebook requis",
        description: "Vous devez d'abord connecter votre page Facebook avant de pouvoir connecter Instagram",
        variant: "destructive",
      });
      return;
    }
    onConnectInstagram?.();
  };

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Automatisez vos publications immobilières
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Importez vos annonces Centris et publiez-les automatiquement sur Facebook et Instagram avec des descriptions générées par IA.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={onConnectFacebook}
              disabled={loading}
            >
              <Facebook className="w-5 h-5 mr-2" />
              {profile?.facebook_page_id
                ? "Page Facebook connectée"
                : "Connecter votre page Facebook"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleInstagramConnect}
              disabled={loading || !onConnectInstagram}
            >
              <Instagram className="w-5 h-5 mr-2" />
              {profile?.instagram_user_id
                ? "Compte Instagram connecté"
                : "Connecter votre compte Instagram"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
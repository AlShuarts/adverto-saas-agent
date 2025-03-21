
import { useEffect, useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Image, Download, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type SoldBannerStatusProps = {
  listing: Tables<"listings">;
};

type SoldBannerRender = {
  id: string;
  listing_id: string;
  render_id: string;
  status: string;
  image_url: string | null;
  created_at: string;
  banner_type: string; // "VENDU" ou "A_VENDRE"
  user_id: string;
  updated_at: string;
};

export const SoldBannerStatus = ({ listing }: SoldBannerStatusProps) => {
  const [renders, setRenders] = useState<SoldBannerRender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const fetchRenders = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("sold_banner_renders")
        .select("*")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Erreur lors de la récupération des bannières:", error);
        return;
      }
      
      console.log("Bannières récupérées:", data);
      
      // Ensure all records have the banner_type property
      const processedData = data?.map(render => ({
        ...render,
        banner_type: render.banner_type || "VENDU" // Use the actual property now that it exists in the DB
      })) || [];
      
      setRenders(processedData as SoldBannerRender[]);
    } catch (error) {
      console.error("Erreur lors de la récupération des bannières:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Vérification manuelle du statut d'un rendu
  const checkRenderStatus = async (renderId: string) => {
    try {
      setIsRefreshing(true);
      
      const { data, error } = await supabase.functions.invoke('check-render-status', {
        body: { renderId }
      });
      
      if (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        return;
      }
      
      console.log('Réponse de la vérification du statut:', data);
      
      // Si le statut a été mis à jour, actualiser la liste
      if (data.status === "done" || data.videoUrl || data.url) {
        fetchRenders();
        
        // Si la bannière est prête, afficher une notification
        if (data.status === "done") {
          toast.success("Votre bannière est prête !", {
            description: "Vous pouvez maintenant la télécharger ou la partager.",
          });
        }
      } else {
        setIsRefreshing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (listing.id) {
      fetchRenders();
    }
  }, [listing.id]);

  // Abonnement aux changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('sold_banner_renders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sold_banner_renders',
          filter: `listing_id=eq.${listing.id}`,
        },
        (payload) => {
          console.log('Changement dans les bannières:', payload);
          fetchRenders();

          // Si une bannière est terminée, afficher une notification
          if (
            payload.eventType === 'UPDATE' &&
            payload.new.status === 'completed' &&
            payload.old.status === 'pending'
          ) {
            const bannerType = payload.new.banner_type === 'VENDU' ? 'VENDU' : 'À VENDRE';
            toast.success(`Votre bannière "${bannerType}" est prête !`, {
              description: "Vous pouvez maintenant la télécharger ou la partager.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listing.id]);

  // Vérifier périodiquement le statut des bannières en attente
  useEffect(() => {
    if (renders.length > 0 && renders[0].status === "pending") {
      const checkInterval = setInterval(() => {
        console.log("Vérification automatique du statut du rendu...");
        checkRenderStatus(renders[0].render_id);
      }, 15000); // Vérifier toutes les 15 secondes
      
      return () => clearInterval(checkInterval);
    }
  }, [renders]);

  // Si aucun render ou chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        <span>Chargement des bannières...</span>
      </div>
    );
  }

  if (renders.length === 0) {
    return null;
  }

  const latestRender = renders[0];
  // Make sure we properly format A_VENDRE to "À VENDRE" for display
  const bannerType = latestRender.banner_type === 'VENDU' ? 'VENDU' : 'À VENDRE';

  // Si la bannière est en cours de création
  if (latestRender.status === "pending") {
    return (
      <div className="border rounded-md p-4 text-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <h3 className="text-lg font-medium">Bannière "{bannerType}" en cours de création</h3>
          <p className="text-sm text-muted-foreground">
            Cela peut prendre quelques instants...
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => checkRenderStatus(latestRender.render_id)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Vérifier le statut
          </Button>
        </div>
      </div>
    );
  }

  // Si la bannière est prête
  if (latestRender.status === "completed" && latestRender.image_url) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-2">Bannière "{bannerType}"</h3>
        <div className="aspect-video overflow-hidden rounded-md mb-4">
          <img
            src={latestRender.image_url}
            alt={`Bannière ${bannerType}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(latestRender.image_url || "", "_blank")}
          >
            <Image className="h-4 w-4 mr-2" />
            Voir
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // Télécharger l'image
              const link = document.createElement("a");
              link.href = latestRender.image_url || "";
              link.download = `${bannerType.toLowerCase()}-${listing.address || "propriete"}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>
    );
  }

  // En cas d'erreur
  return (
    <div className="border rounded-md p-4 text-center">
      <p className="text-red-500">
        Une erreur est survenue lors de la création de la bannière.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => fetchRenders()}
      >
        Réessayer
      </Button>
    </div>
  );
};

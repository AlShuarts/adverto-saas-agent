import { useEffect, useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Image, Download, RefreshCw, Facebook, Instagram, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  banner_type: string;
  user_id: string;
  updated_at: string;
};

export const SoldBannerStatus = ({ listing }: SoldBannerStatusProps) => {
  const [renders, setRenders] = useState<SoldBannerRender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const { publishToFacebook } = useFacebookPublish(listing);

  const fetchRenders = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      const { data, error } = await supabase
        .from("sold_banner_renders")
        .select("*")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Erreur lors de la récupération des bannières:", error);
        setHasError(true);
        setErrorMessage(error.message);
        return;
      }
      
      console.log("Bannières récupérées:", data);
      
      const processedData = data?.map(render => ({
        ...render,
        banner_type: render.banner_type || "VENDU"
      })) || [];
      
      setRenders(processedData as SoldBannerRender[]);
    } catch (error) {
      console.error("Erreur lors de la récupération des bannières:", error);
      setHasError(true);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkRenderStatus = async (renderId: string) => {
    try {
      setIsRefreshing(true);
      setHasError(false);
      
      const { data, error } = await supabase.functions.invoke('check-render-status', {
        body: { renderId }
      });
      
      if (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        setHasError(true);
        setErrorMessage(error.message);
        setIsRefreshing(false);
        return;
      }
      
      console.log('Réponse de la vérification du statut:', data);
      
      if (data.status === "done" || data.videoUrl || data.url) {
        fetchRenders();
        
        if (data.status === "done") {
          toast.success("Votre bannière est prête !", {
            description: "Vous pouvez maintenant la télécharger ou la partager.",
          });
        }
      } else if (data.status === "failed") {
        setHasError(true);
        setErrorMessage("La génération de la bannière a échoué. Veuillez réessayer.");
        setIsRefreshing(false);
      } else {
        setIsRefreshing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      setHasError(true);
      setErrorMessage(error.message);
      setIsRefreshing(false);
    }
  };

  const handleFacebookShare = async (imageUrl: string, bannerType: string) => {
    try {
      setIsPublishing(true);
      
      const propertyType = listing.property_type ? `${listing.property_type} ` : '';
      const message = bannerType === 'VENDU' 
        ? `🎉 ${propertyType}${bannerType} 🎉\n\n${listing.address || 'Propriété'}`
        : `🏠 ${propertyType}À VENDRE 🏠\n\n${listing.address || 'Propriété'}\n\n${listing.bedrooms || ''} ch. | ${listing.bathrooms || ''} sdb. | ${listing.price ? new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(listing.price) : ''}`;
      
      const result = await publishToFacebook(imageUrl, message);
      
      if (result) {
        toast.success("Bannière publiée sur Facebook avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la publication sur Facebook:", error);
      toast.error("Erreur lors de la publication sur Facebook");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleInstagramShare = async (imageUrl: string, bannerType: string) => {
    try {
      setIsPublishing(true);
      
      const propertyType = listing.property_type ? `${listing.property_type} ` : '';
      const message = bannerType === 'VENDU' 
        ? `🎉 ${propertyType}${bannerType} 🎉\n\n${listing.address || 'Propriété'}`
        : `🏠 ${propertyType}À VENDRE 🏠\n\n${listing.address || 'Propriété'}\n\n${listing.bedrooms || ''} ch. | ${listing.bathrooms || ''} sdb. | ${listing.price ? new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(listing.price) : ''}`;
      
      await ensureAndIncrementStatistic('instagram');
      
      const { error } = await supabase.functions.invoke('instagram-publish', {
        body: {
          message,
          images: [imageUrl],
          listingId: listing.id
        },
      });
      
      if (error) {
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success("Bannière publiée sur Instagram avec succès !");
    } catch (error) {
      console.error("Erreur lors de la publication sur Instagram:", error);
      toast.error("Erreur lors de la publication sur Instagram");
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (listing.id) {
      fetchRenders();
    }
  }, [listing.id]);

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

  useEffect(() => {
    if (renders.length > 0 && renders[0].status === "pending") {
      const checkInterval = setInterval(() => {
        console.log("Vérification automatique du statut du rendu...");
        checkRenderStatus(renders[0].render_id);
      }, 15000);
      
      return () => clearInterval(checkInterval);
    }
  }, [renders]);

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
  const bannerType = latestRender.banner_type === 'VENDU' ? 'VENDU' : 'À VENDRE';

  if (latestRender.status === "pending") {
    return (
      <div className="border rounded-md p-4 text-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <h3 className="text-lg font-medium">Bannière "{bannerType}" en cours de création</h3>
          <p className="text-sm text-muted-foreground">
            Cela peut prendre quelques instants...
          </p>
          {hasError && (
            <Alert variant="destructive" className="mt-4 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage || "Une erreur s'est produite."}</AlertDescription>
            </Alert>
          )}
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
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFacebookShare(latestRender.image_url || "", bannerType)}
            disabled={isPublishing}
            className="flex items-center justify-center"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Facebook className="h-4 w-4 mr-2" />
            )}
            Publier sur Facebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleInstagramShare(latestRender.image_url || "", bannerType)}
            disabled={isPublishing}
            className="flex items-center justify-center"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Instagram className="h-4 w-4 mr-2" />
            )}
            Publier sur Instagram
          </Button>
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

  return (
    <div className="border rounded-md p-4 text-center">
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Une erreur est survenue lors de la création de la bannière.
          {errorMessage ? ` ${errorMessage}` : ""}
        </AlertDescription>
      </Alert>
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

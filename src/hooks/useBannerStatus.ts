
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const useBannerStatus = (listingId: string) => {
  const [renders, setRenders] = useState<SoldBannerRender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRenders = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      const { data, error } = await supabase
        .from("sold_banner_renders")
        .select("*")
        .eq("listing_id", listingId)
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
            description: "Vous pouvez maintenant la télécharger ou la partager."
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

  useEffect(() => {
    if (listingId) {
      fetchRenders();
    }
  }, [listingId]);

  useEffect(() => {
    const channel = supabase
      .channel('sold_banner_renders_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sold_banner_renders',
        filter: `listing_id=eq.${listingId}`
      }, payload => {
        console.log('Changement dans les bannières:', payload);
        fetchRenders();
        
        if (payload.eventType === 'UPDATE' && 
            payload.new.status === 'completed' && 
            payload.old.status === 'pending') {
          const bannerType = payload.new.banner_type === 'VENDU' ? 'VENDU' : 'À VENDRE';
          toast.success(`Votre bannière "${bannerType}" est prête !`, {
            description: "Vous pouvez maintenant la télécharger ou la partager."
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId]);

  useEffect(() => {
    if (renders.length > 0 && renders[0].status === "pending") {
      const checkInterval = setInterval(() => {
        console.log("Vérification automatique du statut du rendu...");
        checkRenderStatus(renders[0].render_id);
      }, 15000);
      
      return () => clearInterval(checkInterval);
    }
  }, [renders]);

  return {
    renders,
    isLoading,
    isRefreshing,
    hasError,
    errorMessage,
    checkRenderStatus
  };
};


import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SoldBannerStatusProps = {
  listing: Tables<"listings">;
};

export const SoldBannerStatus = ({ listing }: SoldBannerStatusProps) => {
  const [render, setRender] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasNotified = useRef(false);
  
  useEffect(() => {
    const fetchRenderStatus = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sold_banner_renders')
          .select('*')
          .eq('listing_id', listing.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) throw error;
        setRender(data);
      } catch (err) {
        console.error("Error fetching sold banner status:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRenderStatus();
    
    // Set up a subscription to listen for changes
    const channel = supabase
      .channel(`sold_banner_renders:listing_id=eq.${listing.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sold_banner_renders',
        filter: `listing_id=eq.${listing.id}`
      }, (payload) => {
        setRender(payload.new);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [listing.id]);

  useEffect(() => {    
    if (render && !hasNotified.current) {
      const notificationKey = `sold-banner-${listing.id}-${render.status}`;
      const hasBeenNotified = localStorage.getItem(notificationKey);

      if (!hasBeenNotified) {
        if (render.status === "completed" && render.image_url) {
          hasNotified.current = true;
          localStorage.setItem(notificationKey, "true");
          toast("Bannière VENDU prête !", {
            description: "Votre bannière est prête à être visionnée.",
            action: {
              label: "Voir",
              onClick: () => window.open(render.image_url, "_blank"),
            },
            duration: 10000, // Reste affiché 10 secondes
          });
        } else if (render.status === "error") {
          hasNotified.current = true;
          localStorage.setItem(notificationKey, "true");
          toast.error("Erreur de création", {
            description: "Une erreur est survenue lors de la création de la bannière.",
          });
        }
      }
    }
  }, [render, listing.id]);

  if (isLoading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Vérification du statut de la bannière...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Erreur lors de la vérification du statut
      </div>
    );
  }

  // Don't show any status message when there's no render
  if (!render) {
    return null;
  }

  if (render.status === "error") {
    return (
      <div className="mt-2 text-sm text-destructive flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Une erreur est survenue lors de la création de la bannière
      </div>
    );
  }

  if (render.status === "completed" && render.image_url) {
    return (
      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            window.open(render.image_url, "_blank");
          }}
        >
          Voir la bannière VENDU
        </Button>
      </div>
    );
  }

  if (render.status === "pending" || render.status === "processing") {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Création de la bannière en cours...
      </div>
    );
  }

  return null;
};

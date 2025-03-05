
import { Tables } from "@/integrations/supabase/types";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

type SlideshowStatusProps = {
  listing: Tables<"listings">;
};

export const SlideshowStatus = ({ listing }: SlideshowStatusProps) => {
  const { data: render, isLoading, error } = useSlideshowStatus(listing.id);
  const hasNotified = useRef(false);

  useEffect(() => {
    console.log("SlideshowStatus render data:", render);
    
    if (render && !hasNotified.current) {
      const notificationKey = `slideshow-${listing.id}-${render.status}`;
      const hasBeenNotified = localStorage.getItem(notificationKey);

      if (!hasBeenNotified) {
        if (render.status === "completed" && render.video_url) {
          hasNotified.current = true;
          localStorage.setItem(notificationKey, "true");
          toast("Diaporama prêt !", {
            description: "Votre diaporama est prêt à être visionné.",
            action: {
              label: "Voir",
              onClick: () => window.open(render.video_url, "_blank"),
            },
            duration: 10000, // Reste affiché 10 secondes
          });
        } else if (render.status === "error") {
          hasNotified.current = true;
          localStorage.setItem(notificationKey, "true");
          toast.error("Erreur de création", {
            description: "Une erreur est survenue lors de la création du diaporama.",
          });
        }
      }
    }
  }, [render, listing.id]);

  if (isLoading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Vérification du statut du diaporama...
      </div>
    );
  }

  if (error) {
    console.error("Error in SlideshowStatus:", error);
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Erreur lors de la vérification du statut
      </div>
    );
  }

  if (!render) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        Aucun diaporama en cours pour ce listing
      </div>
    );
  }

  if (render.status === "error") {
    return (
      <div className="mt-2 text-sm text-destructive flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Une erreur est survenue lors de la création du diaporama
      </div>
    );
  }

  if (render.status === "completed" && render.video_url) {
    return (
      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            window.open(render.video_url, "_blank");
          }}
        >
          Voir le diaporama
        </Button>
      </div>
    );
  }

  if (render.status === "pending" || render.status === "processing") {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Création du diaporama en cours...
      </div>
    );
  }

  return null;
};

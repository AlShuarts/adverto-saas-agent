
import { Tables } from "@/integrations/supabase/types";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SlideshowStatusProps = {
  listing: Tables<"listings">;
};

export const SlideshowStatus = ({
  listing
}: SlideshowStatusProps) => {
  const {
    data: render,
    isLoading,
    error,
    refetch
  } = useSlideshowStatus(listing.id);
  
  const hasNotified = useRef(false);
  const [isForceChecking, setIsForceChecking] = useState(false);
  
  // Force check with the API if we're showing 'processing' or 'rendering' for too long
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (render && (render.status === "pending" || render.status === "processing" || render.status === "rendering")) {
      // If we're still in processing state after 5 seconds, force a direct check
      timeoutId = window.setTimeout(async () => {
        if (!render.render_id) return;
        
        setIsForceChecking(true);
        try {
          console.log("Forcing a direct check with the API for render:", render.render_id);
          const response = await supabase.functions.invoke('check-render-status', {
            body: { renderId: render.render_id }
          });
          
          if (response.data) {
            console.log('Force check returned status:', response.data.status);
            
            // Immediately refetch the render status from DB regardless of status returned
            refetch();
            
            // Si le statut est complété mais que notre base de données n'est pas à jour,
            // forçons une mise à jour immédiate dans la base de données
            if ((response.data.status === "completed" || response.data.status === "done") &&
                render.status !== "completed" && render.status !== "done") {
              
              const updateData: any = { status: "completed" };
              
              if (response.data.videoUrl || response.data.url) {
                updateData.video_url = response.data.videoUrl || response.data.url;
              }
              
              console.log("Force updating render in DB to completed:", updateData);
              
              try {
                const { error: updateError } = await supabase
                  .from("slideshow_renders")
                  .update(updateData)
                  .eq("id", render.id);
                
                if (updateError) {
                  console.error("Error force updating render:", updateError);
                } else {
                  console.log("Render force updated successfully");
                  refetch(); // Re-fetch one more time after update
                }
              } catch (dbErr) {
                console.error("DB update error:", dbErr);
              }
            }
          }
        } catch (err) {
          console.error("Error forcing render check:", err);
        } finally {
          setIsForceChecking(false);
        }
      }, 5000);
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [render, refetch]);
  
  useEffect(() => {
    console.log("SlideshowStatus render data:", render);
    if (render && !hasNotified.current) {
      const notificationKey = `slideshow-${listing.id}-${render.status}`;
      const hasBeenNotified = localStorage.getItem(notificationKey);
      
      if (!hasBeenNotified) {
        if ((render.status === "completed" || render.status === "done") && render.video_url) {
          hasNotified.current = true;
          localStorage.setItem(notificationKey, "true");
          toast.success("Diaporama prêt !", {
            description: "Votre diaporama est prêt à être visionné.",
            action: {
              label: "Voir",
              onClick: () => window.open(render.video_url, "_blank")
            },
            duration: 10000 // Reste affiché 10 secondes
          });
        } else if (render.status === "error") {
          hasNotified.current = true;
          localStorage.setItem(notificationKey, "true");
          toast.error("Erreur de création", {
            description: "Une erreur est survenue lors de la création du diaporama. Veuillez réessayer.",
            duration: 10000
          });
        }
      }
    }
  }, [render, listing.id]);

  if (isLoading) {
    return <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Vérification du statut du diaporama...
      </div>;
  }
  
  if (error) {
    console.error("Error in SlideshowStatus:", error);
    return <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Erreur lors de la vérification du statut
      </div>;
  }

  // Don't show any status message when there's no render
  if (!render) {
    return null;
  }
  
  if (render.status === "error") {
    return <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Échec de la création du diaporama
      </div>;
  }

  // Accepter les deux statuts "completed" ou "done"
  if ((render.status === "completed" || render.status === "done") && render.video_url) {
    return <div className="mt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => {
        window.open(render.video_url, "_blank");
      }}>
          Voir le diaporama
        </Button>
      </div>;
  }
  
  if (render.status === "pending" || render.status === "processing" || render.status === "rendering") {
    return <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {isForceChecking ? "Vérification du statut..." : "Création du diaporama en cours..."}
      </div>;
  }
  
  return null;
};

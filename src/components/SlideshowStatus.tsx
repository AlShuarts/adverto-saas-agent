
import { Tables } from "@/integrations/supabase/types";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type SlideshowStatusProps = {
  listing: Tables<"listings">;
};

export const SlideshowStatus = ({ listing }: SlideshowStatusProps) => {
  const { data: render, isLoading } = useSlideshowStatus(listing.id);

  if (isLoading || !render) return null;

  if (render.status === "error") {
    return (
      <div className="mt-2 text-sm text-destructive">
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

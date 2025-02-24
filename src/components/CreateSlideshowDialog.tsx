
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SlideshowConfig = {
  imageDuration: number;
  showPrice: boolean;
  showDetails: boolean;
  transition: string;
  musicVolume: number;
};

type CreateSlideshowDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const CreateSlideshowDialog = ({
  listing,
  isOpen,
  onClose,
}: CreateSlideshowDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<SlideshowConfig>({
    imageDuration: 3,
    showPrice: true,
    showDetails: true,
    transition: "fade",
    musicVolume: 0.5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const response = await supabase.functions.invoke("create-slideshow", {
        body: {
          listingId: listing.id,
          config,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Création du diaporama initiée",
        description: "Vous serez notifié lorsque le diaporama sera prêt.",
      });
      onClose();
    } catch (error) {
      console.error("Error creating slideshow:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du diaporama.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un diaporama</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de votre diaporama vidéo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Durée par image (secondes)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={10}
              value={config.imageDuration}
              onChange={(e) =>
                setConfig({ ...config, imageDuration: Number(e.target.value) })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showPrice">Afficher le prix</Label>
            <Switch
              id="showPrice"
              checked={config.showPrice}
              onCheckedChange={(checked) =>
                setConfig({ ...config, showPrice: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showDetails">Afficher les détails</Label>
            <Switch
              id="showDetails"
              checked={config.showDetails}
              onCheckedChange={(checked) =>
                setConfig({ ...config, showDetails: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="musicVolume">Volume de la musique</Label>
            <Input
              id="musicVolume"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={config.musicVolume}
              onChange={(e) =>
                setConfig({ ...config, musicVolume: Number(e.target.value) })
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer le diaporama"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

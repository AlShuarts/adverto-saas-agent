import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateSlideshow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-slideshow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ listingId: listing.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create slideshow");
      }

      const { url } = await response.json();

      toast({
        title: "Succès",
        description: "Le diaporama a été créé avec succès",
      });

      // Ouvrir le diaporama dans un nouvel onglet
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error creating slideshow:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le diaporama",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCreateSlideshow}
      disabled={isLoading}
    >
      {isLoading ? "Création..." : "Créer un diaporama"}
    </Button>
  );
};
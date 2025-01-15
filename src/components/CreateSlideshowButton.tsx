import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateSlideshow = async () => {
    setIsLoading(true);
    try {
      console.log('Starting slideshow creation for listing:', listing.id);
      
      const { data, error } = await supabase.functions.invoke('create-slideshow', {
        body: { listingId: listing.id }
      });

      console.log('Response from create-slideshow:', data);

      if (error) {
        console.error('Error from create-slideshow:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('Error in response:', data);
        throw new Error(data?.error || 'Failed to create slideshow');
      }

      if (!data?.url) {
        console.error('No URL in response:', data);
        throw new Error('No URL returned from server');
      }

      console.log('Slideshow created successfully:', data);

      toast({
        title: "Succès",
        description: "Le diaporama a été créé avec succès",
      });

      // Ouvrir le diaporama dans un nouvel onglet
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error creating slideshow:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le diaporama",
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
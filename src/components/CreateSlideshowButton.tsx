import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoading, setVideoUrl } = useSlideshow({ 
    listing,
    images: listing.images || []
  });
  const { publishToFacebook, isPublishing } = useFacebookPublish(listing);

  const handleCreateVideo = async () => {
    try {
      setIsOpen(true);
      const { data, error } = await supabase.functions.invoke('create-slideshow', {
        body: { listingId: listing.id }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Mettre à jour la colonne video_url dans la base de données
        const { error: updateError } = await supabase
          .from('listings')
          .update({ video_url: data.url })
          .eq('id', listing.id);

        if (updateError) {
          throw updateError;
        }

        setVideoUrl(data.url);
        queryClient.invalidateQueries({ queryKey: ["listings"] });
        
        toast({
          title: "Succès",
          description: "La vidéo a été générée avec succès",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la vidéo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la vidéo",
        variant: "destructive",
      });
      setIsOpen(false);
    }
  };

  const handlePublish = async () => {
    if (!listing.video_url) {
      toast({
        title: "Erreur",
        description: "Aucune vidéo n'a été générée",
        variant: "destructive",
      });
      return;
    }

    const success = await publishToFacebook(listing.video_url);
    if (success) {
      setIsOpen(false);
    }
  };

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateVideo}
        disabled={isLoading || isPublishing}
      >
        {isLoading ? "Génération en cours..." : "Créer une vidéo"}
      </Button>

      <SlideshowPreviewDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        listing={listing}
        musicUrl="/background-music.mp3"
      />
    </>
  );
};
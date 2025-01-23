import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { SlideshowPreviewDialog } from "./slideshow/SlideshowPreviewDialog";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, setIsLoading } = useSlideshow({ 
    listing,
    images: listing.images || []
  });
  const { publishToFacebook, isPublishing } = useFacebookPublish(listing);
  const { toast } = useToast();

  const handleCreateSlideshow = async () => {
    if (!listing.video_url) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-slideshow-mp4', {
          body: {
            images: listing.images,
            listingId: listing.id,
          },
        });

        if (error) {
          throw error;
        }

        if (!data?.url) {
          throw new Error('No video URL returned');
        }

        toast({
          title: "Diaporama créé",
          description: "Le diaporama a été généré avec succès.",
        });
      } catch (error) {
        console.error('Error creating slideshow:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la création du diaporama.",
          variant: "destructive",
        });
        return;
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(true);
  };

  const handlePublish = async (message: string) => {
    try {
      // Récupérer la dernière version du listing
      const { data: updatedListing, error: fetchError } = await supabase
        .from('listings')
        .select('video_url')
        .eq('id', listing.id)
        .single();

      if (fetchError || !updatedListing?.video_url) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'URL du diaporama.",
          variant: "destructive",
        });
        return false;
      }

      // Vérifier que c'est une URL Supabase Storage
      const isSupabaseUrl = updatedListing.video_url.includes('supabase.co/storage/v1/object/public/listings-images');
      if (!isSupabaseUrl) {
        toast({
          title: "Erreur",
          description: "L'URL du diaporama n'est pas valide.",
          variant: "destructive",
        });
        return false;
      }

      const success = await publishToFacebook(updatedListing.video_url, message);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Le diaporama a été publié sur Facebook avec succès.",
        });
        setIsOpen(false);
        return true;
      } else {
        toast({
          title: "Erreur",
          description: "La publication sur Facebook a échoué.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
      return false;
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
        onClick={handleCreateSlideshow}
        disabled={isLoading || isPublishing}
      >
        {isLoading ? "Génération en cours..." : "Prévisualiser le diaporama"}
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
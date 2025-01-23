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
    console.log('Starting slideshow creation for listing:', listing.id);
    console.log('Images to process:', listing.images);
    
    if (!listing.images || listing.images.length === 0) {
      console.error('No images available for the listing');
      toast({
        title: "Erreur",
        description: "Aucune image n'est disponible pour créer le diaporama.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling create-slideshow-mp4 function with images:', listing.images.length);
      const { data, error } = await supabase.functions.invoke('create-slideshow-mp4', {
        body: {
          images: listing.images,
          listingId: listing.id,
        },
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('No video URL returned');
        throw new Error('No video URL returned');
      }

      console.log('Slideshow created successfully:', data.url);

      // Vérifier que le fichier existe dans Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('listings-images')
        .list('', {
          search: data.url.split('/').pop(),
        });

      if (storageError || !storageData?.length) {
        console.error('File not found in storage:', storageError);
        throw new Error('Le fichier du diaporama n\'a pas été trouvé dans le stockage');
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
    setIsOpen(true);
  };

  const handlePublish = async (message: string) => {
    try {
      console.log('Starting Facebook publication process');
      // Récupérer la dernière version du listing
      const { data: updatedListing, error: fetchError } = await supabase
        .from('listings')
        .select('video_url')
        .eq('id', listing.id)
        .single();

      console.log('Updated listing data:', updatedListing);

      if (fetchError || !updatedListing?.video_url) {
        console.error('Error fetching listing:', fetchError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'URL du diaporama.",
          variant: "destructive",
        });
        return false;
      }

      // Vérifier que c'est une URL Supabase Storage
      const isSupabaseUrl = updatedListing.video_url.includes('supabase.co/storage/v1/object/public/listings-images');
      console.log('Is Supabase URL:', isSupabaseUrl);
      
      if (!isSupabaseUrl) {
        console.error('Invalid video URL:', updatedListing.video_url);
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
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { MusicSelector } from "./slideshow/MusicSelector";
import { SlideshowPlayer } from "./slideshow/SlideshowPlayer";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type CreateSlideshowButtonProps = {
  listing: Tables<"listings">;
};

export const CreateSlideshowButton = ({ listing }: CreateSlideshowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToFacebook = async (videoUrl: string) => {
    try {
      setIsPublishing(true);
      console.log("Début de la publication sur Facebook");

      // Vérifier si l'utilisateur a connecté Facebook
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("facebook_page_id, facebook_access_token")
        .single();

      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError);
        throw new Error("Impossible de récupérer les informations de votre profil");
      }

      if (!profile?.facebook_page_id || !profile?.facebook_access_token) {
        toast({
          title: "Facebook non connecté",
          description: "Veuillez d'abord connecter votre page Facebook dans votre profil",
          variant: "destructive",
        });
        return;
      }

      console.log("Tentative de publication de la vidéo sur Facebook");
      const { data: responseData, error: functionError } = await supabase.functions.invoke("facebook-publish", {
        body: {
          message: `${listing.title}\n${listing.price ? new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(listing.price) : "Prix sur demande"}\n${listing.bedrooms || 0} chambre(s) | ${listing.bathrooms || 0} salle(s) de bain\n${[listing.address, listing.city].filter(Boolean).join(", ")}`,
          video: videoUrl,
          pageId: profile.facebook_page_id,
          accessToken: profile.facebook_access_token,
        },
      });

      if (functionError) {
        console.error("Erreur lors de l'appel de la fonction:", functionError);
        throw new Error(functionError.message || "Erreur lors de la publication sur Facebook");
      }

      console.log("Réponse de la fonction:", responseData);

      if (!responseData?.id) {
        throw new Error("Aucun ID de publication reçu");
      }

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          published_to_facebook: true,
          facebook_post_id: responseData.id,
        })
        .eq("id", listing.id);

      if (updateError) {
        console.error("Erreur lors de la mise à jour du statut:", updateError);
      }

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      // Afficher la confirmation avec le lien vers la publication
      toast({
        title: "Publication réussie ! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>Votre diaporama a été publié sur Facebook avec succès.</p>
            <a
              href={`https://facebook.com/${responseData.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Voir la publication <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ),
        duration: 5000,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur détaillée de publication:", error);
      toast({
        title: "Erreur de publication",
        description: error.message || "Impossible de publier le diaporama sur Facebook",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateSlideshow = async () => {
    if (!listing.images || listing.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune image disponible pour le diaporama",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: { listing }
      });

      if (error) {
        throw error;
      }

      const { musicUrl } = data;
      setSelectedMusic(musicUrl);
      setIsOpen(true);
      
      // Créer le diaporama
      const { data: slideshowData, error: slideshowError } = await supabase.functions.invoke('create-slideshow', {
        body: { listingId: listing.id }
      });

      if (slideshowError) {
        throw slideshowError;
      }

      const { url: videoUrl } = slideshowData;

      // Publier sur Facebook
      await publishToFacebook(videoUrl);

      toast({
        title: "Succès",
        description: "Le diaporama a été créé et publié avec succès",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le diaporama",
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
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateSlideshow}
        disabled={isLoading || isPublishing}
      >
        {isLoading ? "Génération en cours..." : "Créer un diaporama"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Diaporama</DialogTitle>
          <div className="space-y-4">
            {listing.images && (
              <SlideshowPlayer
                images={listing.images}
                musicUrl={selectedMusic}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Share } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type FacebookPublishButtonProps = {
  listing: Tables<"listings">;
};

export const FacebookPublishButton = ({ listing }: FacebookPublishButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToFacebook = async () => {
    try {
      setIsPublishing(true);

      // Vérifier si l'utilisateur a connecté Facebook
      const { data: profile } = await supabase
        .from("profiles")
        .select("facebook_page_id, facebook_access_token")
        .single();

      if (!profile?.facebook_page_id || !profile?.facebook_access_token) {
        toast({
          title: "Facebook non connecté",
          description: "Veuillez d'abord connecter votre page Facebook dans votre profil",
          variant: "destructive",
        });
        return;
      }

      // Créer le message pour Facebook
      const message = `${listing.title}\n\n${listing.description || ""}\n\nPrix: ${
        listing.price ? new Intl.NumberFormat("fr-CA", {
          style: "currency",
          currency: "CAD",
        }).format(listing.price) : "Prix sur demande"
      }\n\n${[listing.address, listing.city].filter(Boolean).join(", ")}`;

      // Publier sur Facebook via l'API Edge Function
      const response = await fetch("/api/facebook/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          images: listing.images,
          pageId: profile.facebook_page_id,
          accessToken: profile.facebook_access_token,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la publication sur Facebook");
      }

      const { id: postId } = await response.json();

      // Mettre à jour le statut de publication dans Supabase
      await supabase
        .from("listings")
        .update({
          published_to_facebook: true,
          facebook_post_id: postId,
        })
        .eq("id", listing.id);

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["listings"] });

      toast({
        title: "Succès",
        description: "L'annonce a été publiée sur Facebook",
      });
    } catch (error) {
      console.error("Erreur de publication:", error);
      toast({
        title: "Erreur",
        description: "Impossible de publier l'annonce sur Facebook",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (listing.published_to_facebook) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={publishToFacebook}
      disabled={isPublishing}
    >
      <Share className="w-4 h-4 mr-2" />
      {isPublishing ? "Publication..." : "Publier sur Facebook"}
    </Button>
  );
};
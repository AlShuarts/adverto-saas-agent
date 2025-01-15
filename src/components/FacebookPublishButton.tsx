import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Share, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FacebookPreview } from "./FacebookPreview";

type FacebookPublishButtonProps = {
  listing: Tables<"listings">;
};

export const FacebookPublishButton = ({ listing }: FacebookPublishButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToFacebook = async (message: string) => {
    try {
      setIsPublishing(true);
      console.log("Début de la publication sur Facebook");

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

      console.log("Profil Facebook trouvé, tentative de publication");

      // Publier sur Facebook via l'API Edge Function
      const response = await fetch("/api/facebook/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          images: listing.images?.slice(0, 2), // Limit to 2 images
          pageId: profile.facebook_page_id,
          accessToken: profile.facebook_access_token,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Erreur de publication:", responseData);
        throw new Error(responseData.details || responseData.error || "Erreur lors de la publication sur Facebook");
      }

      const { id: postId } = responseData;

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

      // Afficher la confirmation avec le lien vers la publication
      toast({
        title: "Publication réussie ! 🎉",
        description: (
          <div className="flex flex-col gap-2">
            <p>Votre annonce a été publiée sur Facebook avec succès.</p>
            <a
              href={`https://facebook.com/${postId}`}
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
      
      setShowPreview(false);
    } catch (error) {
      console.error("Erreur détaillée de publication:", error);
      toast({
        title: "Erreur de publication",
        description: error.message || "Impossible de publier l'annonce sur Facebook",
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
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setShowPreview(true)}
        disabled={isPublishing}
      >
        <Share className="w-4 h-4 mr-2" />
        Prévisualiser et publier sur Facebook
      </Button>

      <FacebookPreview
        listing={listing}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPublish={publishToFacebook}
      />
    </>
  );
};
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Share } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { InstagramPreview } from "./InstagramPreview";

type InstagramPublishButtonProps = {
  listing: Tables<"listings">;
};

export const InstagramPublishButton = ({ listing }: InstagramPublishButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToInstagram = async (message: string, selectedImages: string[]) => {
    try {
      setIsPublishing(true);
      console.log("Début de la publication sur Instagram");

      // Vérifier si l'utilisateur a connecté Instagram
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("instagram_user_id, instagram_access_token")
        .single();

      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError);
        throw new Error("Impossible de récupérer les informations de votre profil");
      }

      console.log("Profil récupéré:", {
        hasUserId: !!profile?.instagram_user_id,
        hasToken: !!profile?.instagram_access_token
      });

      if (!profile?.instagram_user_id || !profile?.instagram_access_token) {
        toast({
          title: "Instagram non connecté",
          description: "Veuillez d'abord connecter votre compte Instagram dans votre profil",
          variant: "destructive",
        });
        return;
      }

      // Appeler la fonction Edge pour publier sur Instagram
      const { data, error } = await supabase.functions.invoke('instagram-publish', {
        body: {
          message,
          images: selectedImages,
          listingId: listing.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Publication réussie",
        description: "Votre annonce a été publiée sur Instagram",
      });
      
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setShowPreview(false);
    } catch (error) {
      console.error("Erreur détaillée de publication:", error);
      toast({
        title: "Erreur de publication",
        description: error.message || "Impossible de publier l'annonce sur Instagram",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

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
        Prévisualiser et publier sur Instagram
      </Button>

      <InstagramPreview
        listing={listing}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onPublish={publishToInstagram}
      />
    </>
  );
};

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

export const useFacebookPublish = (listing: Tables<"listings">) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToFacebook = async (videoUrl: string | null, message: string) => {
    if (!videoUrl) return false;
    
    try {
      setIsPublishing(true);
      console.log("Début de la publication sur Facebook");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour publier");
      }

      // Récupérer le profil pour obtenir pageId et accessToken
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("facebook_page_id, facebook_access_token")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.facebook_page_id || !profile?.facebook_access_token) {
        throw new Error("Veuillez configurer votre page Facebook dans votre profil");
      }

      console.log("Tentative de publication de la vidéo sur Facebook");
      const { data: responseData, error: functionError } = await supabase.functions.invoke("facebook-publish", {
        body: {
          message,
          video: videoUrl,
          pageId: profile.facebook_page_id,
          accessToken: profile.facebook_access_token,
        },
      });

      if (functionError) {
        console.error("Erreur lors de l'appel de la fonction:", functionError);
        throw new Error(functionError.message || "Erreur lors de la publication sur Facebook");
      }

      if (!responseData?.id) {
        throw new Error("Aucun ID de publication reçu");
      }

      // Mettre à jour le statut de l'annonce
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

      // Incrémenter les statistiques d'utilisation pour Facebook
      await ensureAndIncrementStatistic('facebook');

      queryClient.invalidateQueries({ queryKey: ["listings"] });

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

      return true;
    } catch (error) {
      console.error("Erreur détaillée de publication:", error);
      toast({
        title: "Erreur de publication",
        description: error.message || "Impossible de publier le diaporama sur Facebook",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    publishToFacebook,
    isPublishing,
  };
};

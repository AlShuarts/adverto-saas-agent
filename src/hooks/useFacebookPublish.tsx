import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

export const useFacebookPublish = (listing: Tables<"listings">) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToFacebook = async (videoUrl: string | null) => {
    if (!videoUrl) return;
    
    try {
      setIsPublishing(true);
      console.log("Début de la publication sur Facebook");

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

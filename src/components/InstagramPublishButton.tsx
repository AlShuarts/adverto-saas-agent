
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Share } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { InstagramPreview } from "./InstagramPreview";
import { toast } from "sonner";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

type InstagramPublishButtonProps = {
  listing: Tables<"listings">;
};

export const InstagramPublishButton = ({ listing }: InstagramPublishButtonProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const publishToInstagram = async (message: string, selectedImages: string[], templateId?: string) => {
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

      // Vérifier s'il y a un diaporama disponible pour ce listing
      const { data: slideshowData, error: slideshowError } = await supabase
        .from("slideshow_renders")
        .select("video_url")
        .eq("listing_id", listing.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("Diaporama trouvé:", {
        hasSlideshow: !!slideshowData?.video_url,
        videoUrl: slideshowData?.video_url
      });

      // Appeler la fonction Edge pour publier sur Instagram
      const { data, error } = await supabase.functions.invoke('instagram-publish', {
        body: {
          message,
          video: slideshowData?.video_url, // Priorité au diaporama vidéo
          images: slideshowData?.video_url ? undefined : selectedImages, // Images seulement si pas de vidéo
          listingId: listing.id,
          templateId
        },
      });

      if (error) throw error;

      // Incrémenter les statistiques d'utilisation pour Instagram
      await ensureAndIncrementStatistic('instagram');

      const contentType = slideshowData?.video_url ? "diaporama" : "images";
      toast({
        title: "Publication réussie",
        description: `Votre ${contentType} a été publié sur Instagram`,
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

  const handlePreviewClick = async () => {
    // Increment statistics for description generation when preview button is clicked
    await ensureAndIncrementStatistic('description');
    setShowPreview(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handlePreviewClick}
        disabled={isPublishing}
      >
        <Share className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="truncate">Prévisualiser et publier sur Instagram</span>
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

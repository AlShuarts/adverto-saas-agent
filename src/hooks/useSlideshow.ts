
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

type UseSlideshowProps = {
  listing?: Tables<"listings">;
  images?: string[];
  musicUrl?: string | null;
};

export const useSlideshow = ({ listing, images }: UseSlideshowProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const createSlideshow = async () => {
    if (!listing?.id) {
      toast.error("Impossible de créer un diaporama sans annonce");
      return null;
    }
    
    try {
      setIsLoading(true);
      
      // Appeler la fonction edge pour créer le diaporama
      const { data, error } = await supabase.functions.invoke("create-slideshow", {
        body: {
          listingId: listing.id,
          config: {
            selectedImages: listing.images || [],
            musicUrl: "/background-music.mp3"
          }
        }
      });

      if (error) throw error;

      // Si la génération est réussie, incrémenter les statistiques
      await ensureAndIncrementStatistic('slideshow');

      // Mettre à jour l'URL de la vidéo si disponible
      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
      }
      
      return data;
    } catch (error) {
      console.error("Erreur lors de la création du diaporama:", error);
      toast.error("Une erreur est survenue lors de la création du diaporama");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    videoUrl,
    setVideoUrl,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    currentIndex,
    setCurrentIndex,
    createSlideshow
  };
};

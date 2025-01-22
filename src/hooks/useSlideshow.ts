import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useSlideshow = (listing: Tables<"listings">) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const createSlideshow = async () => {
    if (!listing.images || listing.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune image disponible pour le diaporama",
        variant: "destructive",
      });
      return false;
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
      
      const { data: slideshowData, error: slideshowError } = await supabase.functions.invoke('create-slideshow', {
        body: { listingId: listing.id }
      });

      if (slideshowError) {
        throw slideshowError;
      }

      setVideoUrl(slideshowData.url);
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le diaporama",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSlideshow,
    isLoading,
    selectedMusic,
    videoUrl,
    setVideoUrl,
  };
};